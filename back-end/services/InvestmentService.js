'use strict';

const depositService = require('../services/DepositService');
const InvestmentRun = require('../models').InvestmentRun;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const User = require('../models').User;
const Instrument = require('../models').Instrument;
const InstrumentMarketData = require('../models').InstrumentMarketData;
const Asset = require('../models').Asset;
const AssetService = require('./AssetService');
const OrdersService = require('./OrdersService');
const Op = require('sequelize').Op;
const sequelize = require('../models').sequelize;
const RecipeOrder = require('../models').RecipeOrder;
const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const ExecutionOrder = require('../models').ExecutionOrder;
const ExecutionOrderFill = require('../models').ExecutionOrderFill;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;

const createInvestmentRun = async function (user_id, strategy_type, is_simulated = true, deposit_usd) {
  // check for valid strategy type
  if (!Object.values(STRATEGY_TYPES).includes(parseInt(strategy_type, 10))) {
    TE(`Unknown strategy type ${strategy_type}!`);
  }

  let [err, executing_investment_run] = await to(InvestmentRun.count({
    where: {
      is_simulated: false,
      status: {
        [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled
      }
    }
  }));

  if (err) TE(err.message);

  // only allow one REAL investment run at the same time.
  if (executing_investment_run && !is_simulated) {
    let message = `Investment run cannot be initiated as other investment runs are still in progress`;
    TE(message);
  }
  let investment_run;
  [err, investment_run] = await to(InvestmentRun.create({
    strategy_type: strategy_type,
    is_simulated: is_simulated,
    user_created_id: user_id,
    started_timestamp: new Date(),
    updated_timestamp: new Date(),
    status: INVESTMENT_RUN_STATUSES.Initiated,
    deposit_usd: Number(deposit_usd)
  }));
  if (err) TE(err.message);

  return investment_run;
};
module.exports.createInvestmentRun = createInvestmentRun;

const changeInvestmentRunStatus = async function (investment_run_id, status_number) {
  // check for valid recipe run status
  if (!Object.values(INVESTMENT_RUN_STATUSES).includes(parseInt(status_number, 10)))
    TE(`Unknown investment run status ${status_number}!`);

  let err, investment_run;
  investment_run = await InvestmentRun.findById(investment_run_id);

  if (!investment_run) TE("Investment run not found");

  Object.assign(investment_run, {
    status: status_number,
    updated_timestamp: new Date()
  });

  [err, investment_run] = await to(investment_run.save());
  if (err) TE(err.message);

  return investment_run;
};
module.exports.changeInvestmentRunStatus = changeInvestmentRunStatus;

const createRecipeRun = async function (user_id, investment_run_id) {
  let err, investment_run, recipe_run, recipe_run_detail;

  recipe_run = await RecipeRun.findOne({
    where: {
      investment_run_id: investment_run_id,
      approval_status: {
        [Op.in]: [RECIPE_RUN_STATUSES.Pending, RECIPE_RUN_STATUSES.Approved]
      }
    }
  });

  if (recipe_run) {
    if (recipe_run.approval_status === RECIPE_RUN_STATUSES.Pending) TE("There is already recipe run pending approval");
    else TE("No more recipe runs can be generated after one was already approved.");
  }

  [err, investment_run] = await to(this.changeInvestmentRunStatus(
    investment_run_id,
    INVESTMENT_RUN_STATUSES.RecipeRun
  ));
  if (err) TE(err.message);

  [err, recipe_run_detail] = await to(this.generateRecipeDetails(investment_run.strategy_type), false);
  if (err) TE(err.message);

  [err, recipe_run] = await to(RecipeRun.create({
    created_timestamp: new Date(),
    investment_run_id,
    user_created_id: user_id,
    approval_status: RECIPE_RUN_STATUSES.Pending,
    approval_comment: '',
  }));

  if (err) TE(err.message);

  // fill recipe_run_details with results from generateRecipeDetails
  [err, recipe_run_detail] = await to(Promise.all(
    recipe_run_detail.map(asset => {
      if (!asset.suggested_action)
        return `No way found to invest into ${asset.symbol}`;
      let action = asset.suggested_action;

      return RecipeRunDetail.create({
        recipe_run_id: recipe_run.id,
        transaction_asset_id: action.transaction_asset_id,
        quote_asset_id: action.quote_asset_id,
        target_exchange_id: action.exchange_id,
        investment_percentage: asset.investment_percentage
      });
    })
  ));

  if (err) TE(err.message);

  return recipe_run;
};
module.exports.createRecipeRun = createRecipeRun;

const generateRecipeDetails = async function (strategy_type) {
  // get assets for recipe
  let err, assets, instruments;

  [err, assets] = await to(AssetService.getStrategyAssets(strategy_type));
  if (err) TE(err.message);

  let base_assets = await Asset.findAll({
    where: {
      is_base: true
    }
  })
  if (typeof base_assets === "undefined" || !base_assets || !base_assets.length)
    TE("Couln't find base assets");
  base_assets.map(asset => asset.toJSON());

  let prices;
  [err, prices] = await to(AssetService.getBaseAssetPrices(), false);
  if (err) TE(err.message);

  base_assets.map((a) => {
    let price = prices.find(b => a.symbol == b.symbol).price;
    a.USD = price;
  });

  // get all the ways to acquire assets
  let possible_actions;
  /**
   * possible_actions action structure:
   * 
   * 
   * instrument_id
   * transaction_asset_id
   * quote_asset_id
   * exchange_id
   * average_volume
   * min_volume_requirement
   * ask_price
   * bid_price
   */
  [err, possible_actions] = await to(Promise.all(
    assets.map((asset) => {
      return AssetService.getAssetInstruments(asset.id);
    })
  ));
  if (err) TE(err.message);

  _.zipWith(assets, possible_actions, (a, b) => a.possible_actions = b);

  let excluded_assets;
  [assets, excluded_assets] = _.partition(assets, (asset) => !asset.is_base);

  // find assets that have no instruments/possible ways to acquire them
  let inaccessible = assets.filter(a => 
    typeof a.possible_actions === 'undefined' || !a.possible_actions.length
  );
  if (inaccessible.length) {
    TE(`Couldn't find a way to acquire these assets: ${inaccessible.map(a => a.symbol)}. `);
  }

  assets.map(asset => {
/*  //if this is a base asset we find a buy action involving another base asset
    if (asset.is_base) {
      const base_asset_ids = _.map(base_assets, 'id');
      asset.suggested_action = _.find(asset.possible_actions, action => {

        return (
          //this action includes buying this asset
          action.transaction_asset_id == asset.id
          //this asset is not the one being sold
          &&
          action.quote_asset_id != asset.id
          //the asset being sold is a base asset
          &&
          base_asset_ids.includes(action.quote_asset_id)
        )

      })
      return;
    } */

    /* Cancel recipe generation if asset doesn't meet minimum volume requirements */
    asset.possible_actions = asset.possible_actions.filter(a =>
      !a.min_volume_requirement // if doesn't have liquidity requirement set
      ||
      a.average_volume >= a.min_volume_requirement // or passes liquidity history
    );
    if (!asset.possible_actions.length) TE('None of instruments for asset %s fulfill liquidity requirements', asset.symbol);

    // calculate asset price in usd when buying through certain insturment/exchange
    asset.possible_actions = asset.possible_actions.map((instrument) => {
      let is_sell = instrument.quote_asset_id == asset.id;
      // flip assets if it's a sell
      if (is_sell) {
        [instrument.transaction_asset_id, instrument.quote_asset_id] = [instrument.quote_asset_id, instrument.transaction_asset_id];
      }
      let base_asset_id = instrument.quote_asset_id;

      // get base asset price in usd
      let base_asset, base_asset_usd_price;
      if (base_asset = base_assets.find(ba => ba.id == base_asset_id))
        base_asset_usd_price = base_asset.USD;
      else
        TE("Didn't find base asset with id",
          is_sell ? instrument.transaction_asset_id : instrument.quote_asset_id
        );

      /* To find cheapest way to purchase asset first find out the price of asset in USD
       if it would be acquired this way. If it's a sell position, then invert price of
       bid order. */
      let cost_usd = base_asset_usd_price * (is_sell ?
        Decimal(1).div(Decimal(instrument.bid_price)).toNumber() :
        instrument.ask_price);

      Object.assign(instrument, {
        is_sell,
        cost_usd
      });
      return instrument;
    });

    // find cheapest way to acquire asset
    asset.suggested_action = _.minBy(asset.possible_actions, 'cost_usd');
  });

  // filter out assets that can't be acquired based on if they have suggested action or not
  assets = _.filter(assets, a => a.suggested_action != null);

  // calculate investment percentage
  const total_marketshare = _.sumBy(assets, 'avg_share');

  assets.map(asset => {
    asset.investment_percentage = 100 / assets.length;
    /* // investment percentage proportional to asset marketshare
    Decimal(100).div(Decimal(total_marketshare)).mul(Decimal(asset.avg_share)).toNumber(); */
    return asset;
  });

  return assets;
};
module.exports.generateRecipeDetails = generateRecipeDetails;

const changeRecipeRunStatus = async function (user_id, recipe_run_id, status_constant, comment) {
  // check for valid recipe run status
  if (!Object.values(RECIPE_RUN_STATUSES).includes(parseInt(status_constant, 10)))
    TE(`Unknown recipe run status ${status_constant}!`);

  if (!comment) TE('Comment not provided');

  let err, recipe_run;
  recipe_run = await RecipeRun.findById(recipe_run_id);

  if (!recipe_run) TE("Recipe run not found");

  const old_status = recipe_run.approval_status;

  Object.assign(recipe_run, {
    approval_status: status_constant,
    approval_user_id: user_id,
    approval_timestamp: new Date(),
    approval_comment: comment
  });

  //approving recipe run that was not approved before, try generate empty deposits and set the investment run status to RecipedApproved
  if (status_constant == RECIPE_RUN_STATUSES.Approved && old_status !== status_constant) {

    [err] = await to(depositService.generateRecipeRunDeposits(recipe_run));

    if (err) TE(err.message);

    let result = [];
    [err, result] = await to(Promise.all([
      recipe_run.save(),
      InvestmentRun.update({
        status: INVESTMENT_RUN_STATUSES.RecipeApproved
      }, {
        where: {
          id: recipe_run.investment_run_id
        },
        limit: 1
      })
    ]));

    if (err) TE(err.message);

    return result[0];
  } else return recipe_run.save();
};
module.exports.changeRecipeRunStatus = changeRecipeRunStatus;

const findInvestmentRunFromAssociations = async function (entities) {

  // property names show how value can be served, value show what db table is used.
  let allowed_entities = {
    "investment_run_id": 'investment_run',
    "recipe_run_id": 'recipe_run',
    "recipe_deposit_id": 'recipe_run_deposit',
    "recipe_order_group_id": 'recipe_order_group',
    "recipe_order_id": 'recipe_order',
    "execution_order_id": 'execution_order'
  };

  if (!Object.keys(entities).length) TE('No id was supplied. Please supply atleast one ID.')

  let foundClosestEntity = Object.keys(entities).find(entity => {
    return Object.keys(allowed_entities).includes(entity);
  });
  let id_to_find = entities[foundClosestEntity];

  let [err, investment_run] = await to(sequelize.query(`
    SELECT investment_run.*
    FROM investment_run
    LEFT JOIN recipe_run ON recipe_run.investment_run_id=investment_run.id
    LEFT JOIN recipe_run_deposit ON recipe_run_deposit.recipe_run_id=recipe_run.id
    LEFT JOIN recipe_order_group ON recipe_order_group.recipe_run_id=recipe_run.id
    LEFT JOIN recipe_order ON recipe_order.recipe_order_group_id=recipe_order_group.id
    LEFT JOIN execution_order ON execution_order.recipe_order_id=recipe_order.id
    WHERE ${allowed_entities[foundClosestEntity]}.id=:entity_id
  `, {
    replacements: {
      entity_id: id_to_find
    },
    plain: true, // assign as single value, not array
    model: InvestmentRun
  }));

  if (err) TE(err.message);

  return investment_run;
};
module.exports.findInvestmentRunFromAssociations = findInvestmentRunFromAssociations;

const getWholeInvestmentRun = async function (investment_run_id) {
  let [err, all_investment_data] = await to(InvestmentRun.find({
    where: {
      id: investment_run_id
    },
    include: [{
      model: RecipeRun,
      include: [{
          model: RecipeOrderGroup,
          include: [{
            /* This makes sequelize get further includes as in separate query. This is a quick workaround for postgres truncating too long paths. */
            separate: true,
            model: RecipeOrder,
            include: [{
              model: ExecutionOrder,
              include: [{
                model: ExecutionOrderFill,
              }]
            }]
          }]
        },
        {
          model: RecipeRunDeposit
        }
      ]
    }]
  }))

  if (err) TE(err);

  return all_investment_data;
};
module.exports.getWholeInvestmentRun = getWholeInvestmentRun;

const getInvestmentRunTimeline = async function (investment_run_id) {


  let [err, whole_investment] = await to(this.getWholeInvestmentRun(investment_run_id));
  if (err) return ReE(res, err.message, 422);

  if (!whole_investment) TE("Investment run not found!");
  whole_investment = whole_investment.toJSON();

  // prepare investment run data
  let investment_run_data = Object.assign({}, whole_investment);
  delete investment_run_data.RecipeRuns;

  investment_run_data.status = `investment.status.${investment_run_data.status}`;
  investment_run_data.strategy_type = `investment.strategy.${investment_run_data.strategy_type}`;
  investment_run_data.started_timestamp = investment_run_data.started_timestamp.getTime();
  investment_run_data.updated_timestamp = investment_run_data.updated_timestamp.getTime();

  // prepare recipe run data
  let recipe_runs = whole_investment.RecipeRuns,
    recipe_run_data;

  if (!recipe_runs.length) {
    return { // no recipe runs found. Return to avoid further calculations that could cause errors.
      investment_run: investment_run_data,
      recipe_run: null,
      recipe_deposits: null,
      recipe_orders: null,
      execution_orders: null
    }
  }

  recipe_run_data = Object.assign({}, _.maxBy(recipe_runs, rr => { // finds newest by created_timestamp
    rr.created_timestamp = rr.created_timestamp.getTime();
    return rr.created_timestamp;
  }));

  delete recipe_run_data.RecipeOrderGroups;
  delete recipe_run_data.RecipeRunDeposits;
  if (recipe_run_data.approval_timestamp) {
    recipe_run_data.approval_timestamp = recipe_run_data.approval_timestamp.getTime();
  }
  recipe_run_data.approval_status = `recipes.status.${recipe_run_data.approval_status}`;

  // prepare recipe deposit data
  let recipe_deposits = Object.assign({}, whole_investment).RecipeRuns.map(recipe_run => {
    return recipe_run.RecipeRunDeposits;
  })
  recipe_deposits = _.flatten(_.flatten(recipe_deposits));

  if (!recipe_deposits.length) {
    return { // no deposits found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: null,
      recipe_orders: null,
      execution_orders: null
    }
  }


  let deposit_status =
    recipe_deposits.some(deposit => deposit.status == RECIPE_RUN_DEPOSIT_STATUSES.Pending) ?
    RECIPE_RUN_DEPOSIT_STATUSES.Pending :
    RECIPE_RUN_DEPOSIT_STATUSES.Completed;
  let deposit_stats = {
    count: recipe_deposits.length,
    status: `deposits.status.${deposit_status}`
  };

  // prepare recipe order data
  // collects all recipe orders into single flat array
  let recipes = Object.assign({}, whole_investment).RecipeRuns;
  let recipe_order_groups = _.filter(
    _.flatten(recipes.map(recipe_run => {
      return recipe_run.RecipeOrderGroups;
    })), group => group.approval_status != RECIPE_ORDER_GROUP_STATUSES.Rejected);
  let recipe_orders = recipe_order_groups.length ? _.maxBy(recipe_order_groups, rog => rog.created_timestamp.getTime()).RecipeOrders : [];

  if (!recipe_orders.length) {
    return { // no recipe orders found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: deposit_stats,
      recipe_orders: null,
      execution_orders: null
    }
  }

  let order_status;

  if (recipe_orders.every(order => order.status === RECIPE_ORDER_STATUSES.Pending)) {
    order_status = RECIPE_ORDER_STATUSES.Pending;
  } else if (recipe_orders.some(order => order.status === RECIPE_ORDER_STATUSES.Failed)) {
    order_status = RECIPE_ORDER_STATUSES.Failed;
  } else if (recipe_orders.some(order => order.status === RECIPE_ORDER_STATUSES.Executing)) {
    order_status = RECIPE_ORDER_STATUSES.Executing;
  } else if (recipe_orders.every(order => order.status === RECIPE_ORDER_STATUSES.Completed)) {
    order_status = RECIPE_ORDER_STATUSES.Completed;
  }else { //just take status of last created order if all else fails
    order_status = _.maxBy(recipe_orders, 'id').status
  }

  let prepared_recipe_orders = {
    count: recipe_orders.length,
    order_group_id: recipe_orders[0].recipe_order_group_id,
    status: `order.status.${order_status}`
  };

  // prepare execution order data 
  // collects all execution orders into single flat array
  let execution_orders = _.flatten(recipes.map(recipe_run => {

    return _.flatten(
      recipe_run.RecipeOrderGroups.map(recipe_order_group => {

        return _.flatten(
          recipe_order_group.RecipeOrders.map(recipe_order => {

            return recipe_order.ExecutionOrders;
          })
        );
      })
    )
  }));

  if (!execution_orders.length) {
    return { // no execution orders found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: deposit_stats,
      recipe_orders: prepared_recipe_orders,
      execution_orders: null
    }
  }

  let exec_order_status;
  if (execution_orders.some(exec_order => exec_order.status === EXECUTION_ORDER_STATUSES.Failed)) {
    exec_order_status = EXECUTION_ORDER_STATUSES.Failed;
  } else if (whole_investment.status === INVESTMENT_RUN_STATUSES.OrdersFilled) {
    exec_order_status = EXECUTION_ORDER_STATUSES.FullyFilled;
  } else if (whole_investment.status === INVESTMENT_RUN_STATUSES.OrdersExecuting) {
    exec_order_status = EXECUTION_ORDER_STATUSES.Placed;
  }
  let exec_order_data = {
    count: execution_orders.length,
    status: `execution_orders_timeline.status.${exec_order_status}`
  };

  return {
    investment_run: investment_run_data,
    recipe_run: recipe_run_data,
    recipe_deposits: deposit_stats,
    recipe_orders: prepared_recipe_orders,
    execution_orders: exec_order_data
  }
}
module.exports.getInvestmentRunTimeline = getInvestmentRunTimeline;