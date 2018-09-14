'use strict';

const depositService = require('../services/DepositService');
const InvestmentRun = require('../models').InvestmentRun;
const InvestmentAmount = require('../models').InvestmentAmount;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const RecipeRunDetailInvestment = require('../models').RecipeRunDetailInvestment;
const Asset = require('../models').Asset;
const AssetService = require('./AssetService');
const Op = require('sequelize').Op;
const sequelize = require('../models').sequelize;
const RecipeOrder = require('../models').RecipeOrder;
const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;
const InvestmentRunAssetGroup = require('../models').InvestmentRunAssetGroup;
const GroupAsset = require('../models').GroupAsset;

const AdminViewService = require('./AdminViewsService');

const ActionLog = require('../utils/ActionLogUtil');

const getInvestmentRunWithAssetMix = async (investment_run_id, seq_query = {}, sql_where = '') => {
  
  let [ err, investment_run ] = await to(AdminViewService.fetchInvestmentRunView(investment_run_id));

  if(err) TE(err.message);
  if(!investment_run) return null;

  let group_assets = [];
  [ err, group_assets ] = await to(InvestmentRun.findAll({
    where: { id: investment_run_id },
    include: {
      model: InvestmentRunAssetGroup,
      include: GroupAsset,
    },
    raw: true
  }));

  if(err) console.log(err);

  const asset_ids = group_assets.map(asset => asset['InvestmentRunAssetGroup.GroupAssets.asset_id']).filter(id => id);

  //Allow only to filter out assets that belong to the investment run.
  seq_query.where = { 
    [Op.and]: [
      { id: asset_ids },
      seq_query.where
    ] 
  };
  
  const final_seq_query = _.assign({
    attributes: ['id', 'symbol', 'long_name', 'capitalization', 'nvt_ratio', 'market_share'],
    raw: true
  }, seq_query);

  if(asset_ids.length) sql_where = `id IN(${asset_ids.join(', ')}) ${ sql_where !== '' ? `AND ${sql_where}` : '' }`;

  let result = [];
  [ err, result ] = await to(Promise.all([
    AdminViewService.fetchAssetsViewDataWithCount(final_seq_query),
    AdminViewService.fetchAssetsViewFooter(sql_where)
  ]));

  if(err) TE(err.message);

  return [ investment_run, ...result ];
};
module.exports.getInvestmentRunWithAssetMix = getInvestmentRunWithAssetMix;

const createInvestmentRun = async function (user_id, strategy_type, is_simulated = true, deposit_amounts, asset_group_id) {
  // check for valid strategy type
  if (!Object.values(STRATEGY_TYPES).includes(parseInt(strategy_type, 10))) {
    TE(`Unknown strategy type ${strategy_type}!`);
  }

  if (!deposit_amounts.length) TE('No investment amounts given!');

  let [err, deposit_assets] = await to(AssetService.getDepositAssets());
  if (err) TE(err.message);

  let deposit_asset_symbols = deposit_assets.map(asset => asset.symbol);

  // if some of deposit info has an asset that is not for deposits
  if(deposit_amounts.some(
    amount => !deposit_asset_symbols.includes(amount.symbol)
  )) TE('Unacceptable deposit asset given!');

  if(deposit_amounts.some(a => a.amount < 0))
    TE(`Investment amount into any of assets can't be less than 0`);

  // leave only positive investment asset amounts
  deposit_amounts = deposit_amounts.filter(a => a.amount > 0);
  if (!deposit_amounts.length)
    TE(`Total deposit amount must be greather than 0`);

  let executing_investment_run;
  [err, executing_investment_run] = await to(InvestmentRun.count({
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

  let asset_group;
  [ err, asset_group ] = await to(InvestmentRunAssetGroup.findById(asset_group_id));

  if (err) TE(err.message);
  if (!asset_group) TE(`Asset Mix was not found with id "${asset_group_id}"`);

  //check if strategy types match
  if(asset_group.strategy_type !== strategy_type) TE(`Attempting to create a ${_.invert(STRATEGY_TYPES)[strategy_type]} Investment Run with a ${_.invert(STRATEGY_TYPES)[asset_group.strategy_type]} Asset Mix`);
  
  let investment_run;
  [err, investment_run] = await to(sequelize.transaction(transaction => 
    InvestmentRun.create({
      strategy_type: strategy_type,
      is_simulated: is_simulated,
      user_created_id: user_id,
      started_timestamp: new Date(),
      updated_timestamp: new Date(),
      status: INVESTMENT_RUN_STATUSES.Initiated,
      deposit_usd: 0,
      investment_run_asset_group_id: asset_group_id,

      InvestmentAmounts: [ // also create InvestmentAmount for every deposit
          ...deposit_amounts.map(deposit => {
            let asset = deposit_assets.find(asset => asset.symbol == deposit.symbol);
            return {
              asset_id: asset.id,
              amount: deposit.amount
            };
          })
        ]
      }, {
        include: InvestmentAmount, // include to create investment amounts with investment run
        transaction
      })
  ));

  if (err) TE(err.message);

  return investment_run;
};
module.exports.createInvestmentRun = createInvestmentRun;

/** Changes investment run status. Finds investment run by ID if number provided(could be string),
 * or by association if object provided with same keys as in 
 * findInvestmentRunFromAssociations methods allowed_entities object.
 * @param {*} identifying_value integer OR object with "investment_run_id","recipe_run_id",
 * "recipe_deposit_id", "recipe_order_group_id", "recipe_order_id", "execution_order_id"
 * @param {*} status_number 
 */
const changeInvestmentRunStatus = async function (identifying_value, status_number) {
  // check for valid recipe run status
  if (!Object.values(INVESTMENT_RUN_STATUSES).includes(parseInt(status_number, 10)))
    TE(`Unknown investment run status ${status_number}!`);

  let err, investment_run;
  if(_.isNumber(identifying_value) || _.isString(identifying_value)) 
    [err, investment_run] = await to(InvestmentRun.findById(identifying_value));
  else 
    [err, investment_run] = await to(this.findInvestmentRunFromAssociations(identifying_value));
  
  if (err) TE(err.message);

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
  let err, investment_run, recipe_run, recipe_run_details;

  /**
   * It might be fine to keep this here, in most cases to prevent heavier actions being performed.
   */
  recipe_run = await RecipeRun.findOne({
    where: {
      investment_run_id: investment_run_id,
      approval_status: {
        [Op.in]: [RECIPE_RUN_STATUSES.Pending, RECIPE_RUN_STATUSES.Approved]
      }
    },
    raw: true
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

  [err, recipe_run_details] = await to(this.generateRecipeDetails(investment_run.id, investment_run.strategy_type), false);
  if (err) TE(err.message);

  [err, recipe_run] = await to(sequelize.transaction(transaction => 
    RecipeRun.create({
      created_timestamp: new Date(),
      investment_run_id,
      user_created_id: user_id,
      approval_status: RECIPE_RUN_STATUSES.Pending,
      approval_comment: '',

      RecipeRunDetails: recipe_run_details.map(detail => {
        detail.RecipeRunDetailInvestments = detail.detail_investment;
        return detail;
      })
    }, {
      include: [{
        model: RecipeRunDetail,
        include: RecipeRunDetailInvestment
      }], // include to create investment amounts with investment run
      transaction
    })
  ));

  if(err) TE(err.message);

  return recipe_run;
};
module.exports.createRecipeRun = createRecipeRun;

const generateRecipeDetails = async (investment_run_id, strategy_type) => {

  let [err, assets] = await to(AssetService.getAssetGroupWithData(investment_run_id));
  if (err) TE(err.message);

  let prices
  [err, prices] = await to(AssetService.getBaseAssetPrices(), false);
  if (err) TE(err.message);

  // find investment run with its investment deposit amounts.
  let investment_run;
  [err, investment_run] = await to(InvestmentRun.findOne({
    where: {
      id: investment_run_id
    },
    include: [InvestmentAmount]
  }));
  if (err) TE(err.message);

  if (!investment_run) TE('Investment run not found');

  // find liquidity level for each asset.
  assets.map(asset => {
    asset.liquidity_level = AssetService.getLiquidityLevel(asset.volume_usd);
  });

  /* group and map assets to be in structure:
    [
      {
        possible: [], // possible ways to acquire an asset.
        to_execute: [] // details/conversions that will be saved and performed
      }
    ] */ 
  let assets_grouped_by_id = _.map(_.groupBy(assets, 'id'), (asset_group) => {
    let asset = asset_group[0];
    return {
      asset: {
        id: asset.id,
      },
      possible: asset_group,
      to_execute: []
    }
  }).map((asset, index, array) => { // calculate investment percentage
    asset.asset.investment_percentage = Decimal(100).div(Decimal(array.length));
    return asset;
  });

  // calculate investment amounts in USD
  let total_investment_usd = Decimal(0); 
  let investment_size = investment_run.InvestmentAmounts;
  investment_size = investment_size.map(size => {
    let base_price_usd = prices.find(price => price.id==size.asset_id);
    let value_usd;

    if (!base_price_usd) { // not found if it's USD
      value_usd = Decimal(parseFloat(size.amount));
      size.price_per_asset_usd = 1;
    } else {
      value_usd = Decimal(parseFloat(size.amount)).mul(Decimal(parseFloat(base_price_usd.price)));
      size.price_per_asset_usd = parseFloat(base_price_usd.price);
    }

    size.value_usd = value_usd;
    size.remaining_usd = value_usd;

    total_investment_usd = Decimal(total_investment_usd).add(Decimal(size.value_usd));
    return size;
  });

  assets_grouped_by_id.map(asset => {
    let chosen = [];
    let total_spent = new Decimal(0);
    let should_spend = Decimal(total_investment_usd).mul(Decimal(asset.asset.investment_percentage).div(Decimal(100)));

    // sort values by nvt, liquidity_level and price_usd properties
    asset.possible = _.orderBy(asset.possible, ['nvt', 'liquidity_level', 'price_usd'], ['desc', 'desc', 'asc']);

    for (let action of asset.possible) {
      let base = investment_size.find(deposit => deposit.asset_id==action.quote_asset_id);

       // if we have this base asset in deposits and enough to buy
      if (base && base.remaining_usd.gt(0)) {
        let base_spent = new Decimal(0),
          base_needed = Decimal(should_spend).minus(total_spent);

        if (base.remaining_usd.gte(Decimal(base_needed))) { // enough to buy whole amount
          base_spent = Decimal(base_needed);
        } else { // not enough to buy whole needed amount, buy with whats remaining 
          base_spent = Decimal(base.remaining_usd);
        }

        chosen.push({ asset_id: action.quote_asset_id, from_asset_id: base.asset_id, exchange_id: action.exchange_id, amount_usd: base_spent });
        base.remaining_usd = Decimal(base.remaining_usd).minus(Decimal(base_spent));
        total_spent = total_spent.add(Decimal(base_spent));
      }

      let usd = investment_size.find(s => s.asset_id==1);

      // if we didn't yet allocate enough base asset to buy required amount
      if (usd && total_spent.lt(should_spend) && usd.remaining_usd.gt(0)) {
        let deposit_spent = 0,
          usd_needed = Decimal(should_spend).minus(total_spent);

        if (usd_needed.lte(Decimal(usd.remaining_usd))) { // enough to buy whole amount needed
          deposit_spent = Decimal(usd_needed);
        } else { // not enough to buy whole needed amount, buy whith whats remaining
          deposit_spent = Decimal(usd.remaining_usd);
        }
        
        chosen.push({ asset_id: action.quote_asset_id, from_asset_id: usd.asset_id, exchange_id: action.exchange_id, amount_usd: deposit_spent });
        usd.remaining_usd = Decimal(usd.remaining_usd).minus(Decimal(deposit_spent));
        total_spent = total_spent.add(Decimal(deposit_spent));
      }

      if (total_spent.gte(Decimal(should_spend)))
        break; // break cycle if already allocated needed amount
    }

    // if whole needed amount not allocated, then we fail to fully buy an asset
    if (total_spent.lt(Decimal(should_spend))) {
      TE("Couldn't fully buy asset ID " + asset.possible[0].id + " with remaining funds");
    } else {
      asset.to_execute = chosen;
    }
  });

  // calculate amount in base assets
  let recipe_details = assets_grouped_by_id.map(asset => {
    // calculate amount of asset from investment amount in USD
    asset.to_execute.map(investment_detail => {
      let base = investment_size.find(s => s.asset_id == investment_detail.from_asset_id);
      investment_detail.amount = Decimal(investment_detail.amount_usd).div(Decimal(base.price_per_asset_usd));
    });

    // form similar structure to recipe_run_detail and recipe_run_detail_investment
    let details = _.map(_.groupBy(asset.to_execute, (detail) => detail.asset_id), details => {
      let asset_info = details[0];
      let investment_percentage = (
        Decimal(
          details.reduce((acc, val) => acc.add(Decimal(val.amount_usd)), Decimal(0)) // sum all the values
        ).div(
          Decimal(total_investment_usd)
        ).mul(100)
      ).toString();

      return {
        transaction_asset_id: asset.asset.id,
        quote_asset_id: asset_info.asset_id,
        exchange_id: asset_info.exchange_id,
        investment_percentage: investment_percentage,
        detail_investment: details.map(detail => ({
          asset_id: detail.from_asset_id,
          amount: detail.amount.toString(),
          amount_usd: detail.amount_usd.toString(),
        }))
      };
    });
    return details;
  });

  recipe_details = _.flatten(recipe_details);

  return recipe_details;
};
module.exports.generateRecipeDetails = generateRecipeDetails;

const old_generateRecipeDetails = async function (strategy_type) {
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

  // fetch liquidity requirements for all possible_actions
  let liquidity_requirements;
  [err, liquidity_requirements] = await to(Promise.all(assets.map(asset => {
    return Promise.all(
      asset.possible_actions.map(action => {
        console.log(action);
        return AssetService.getInstrumentLiquidityRequirements(action.instrument_id, action.exchange_id)
      })
    )
  })));
  if (err) TE(err);
  
  // assign liquidity requirements to their possible_actions
  _.zipWith(assets, liquidity_requirements, 
    (asset, requirements) => {
      _.zipWith(
        asset.possible_actions,
        requirements,
        (a, b) => a.liquidity = b
      )
    }
  );

  assets.map((asset) => {
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

    // filter out actions that do not pass all requirements assigned to them
    asset.possible_actions = asset.possible_actions.filter(possible_action =>
      possible_action.liquidity.every(requirement => {
        // if !isNaN(requirement.avg_vol) true that means we have liquidity history for that action
        return !isNaN(requirement.avg_vol) && requirement.avg_vol >= requirement.minimum_volume;
      })
    );
    /* Cancel recipe generation if asset doesn't meet minimum volume requirements */
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
  //const total_marketshare = _.sumBy(assets, 'avg_share');

  assets.map(asset => {
    asset.investment_percentage = 100 / assets.length;
    /* // investment percentage proportional to asset marketshare
    Decimal(100).div(Decimal(total_marketshare)).mul(Decimal(asset.avg_share)).toNumber(); */
    return asset;
  });

  return assets;
};
module.exports.old_generateRecipeDetails = old_generateRecipeDetails;

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
    LIMIT 1
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
            /* separate: true, */
            model: RecipeOrder,
            /* include: [{
              model: ExecutionOrder,
              include: [{
                model: ExecutionOrderFill,
              }]
            }] */
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

  // find at least one failed execution order
  let exec_order_statuses;
  [err, exec_order_statuses] = await to(sequelize.query(`
    SELECT eo.status, COUNT(eo.id) as count
    FROM execution_order as eo
    JOIN recipe_order as ro ON ro.id=eo.recipe_order_id
    JOIN recipe_order_group as rog ON rog.id=ro.recipe_order_group_id
    WHERE rog.id=:rog_id
    GROUP BY eo.status
  `, {
    type: sequelize.QueryTypes.SELECT,
    replacements: {
      rog_id: prepared_recipe_orders.order_group_id
    }
  }));

  if (err) TE(err.message);

  let exec_order_count = _.sumBy(exec_order_statuses, eos => parseInt(eos.count, 10));
  if (!exec_order_count) {
    return { // no execution orders found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: deposit_stats,
      recipe_orders: prepared_recipe_orders,
      execution_orders: null
    }
  }

  let exec_order_status;
  if (exec_order_statuses.some(e => e.status == EXECUTION_ORDER_STATUSES.Failed && e.count)) { // if at least one failed execution order found
    exec_order_status = EXECUTION_ORDER_STATUSES.Failed;
  } else if (whole_investment.status === INVESTMENT_RUN_STATUSES.OrdersFilled) {
    exec_order_status = EXECUTION_ORDER_STATUSES.FullyFilled;
  } else if (whole_investment.status === INVESTMENT_RUN_STATUSES.OrdersExecuting) {
    exec_order_status = EXECUTION_ORDER_STATUSES.InProgress;
  }
  let exec_order_data = {
    count: exec_order_count,
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

const generateInvestmentAssetGroup = async function (user_id, strategy_type) {

  let [err, strategy_assets] = await to(AssetService.getStrategyAssets(strategy_type));
  if (err) TE(err.message);

  let arr = [...strategy_assets.map(asset => {
          
    return {
      asset_id: asset.id,
      status: asset.status
    };
  })]

  let group, group_assets;
  [err, group_assets] = await to(sequelize.transaction(transaction => {

    return InvestmentRunAssetGroup.create({
      created_timestamp: new Date(),
      user_id: user_id,
      strategy_type
    }, { transaction }).then(asset_group => {

      group = asset_group;

      return GroupAsset.bulkCreate(strategy_assets.map(asset => {

        return {
          asset_id: asset.id,
          status: asset.status,
          investment_run_asset_group_id: asset_group.id
        };

      }), { transaction, returning: true });

    });
  }));

  if (err) TE(err.message);

  return [ group, group_assets ];
};
module.exports.generateInvestmentAssetGroup = generateInvestmentAssetGroup;