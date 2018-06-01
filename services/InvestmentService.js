'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const User = require('../models').User;
const Instrument = require('../models').Instrument;
const InstrumentMarketData = require('../models').InstrumentMarketData;
const Asset = require('../models').Asset;
const AssetService = require('../services/AssetService');
const Op = require('sequelize').Op;
const sequelize = require('../models').sequelize;

const createInvestmentRun = async function (user_id, strategy_type, is_simulated = true) {
  // check for valid strategy type
  if (!Object.values(STRATEGY_TYPES).includes(parseInt(strategy_type, 10))) {
    TE(`Unknown strategy type ${strategy_type}!`);
  }

  let err, investment_run = await InvestmentRun.findOne({
    where: {
      user_created_id: user_id,
      strategy_type: strategy_type,
      is_simulated: is_simulated,
      completed_timestamp: {
        [Op.eq]: null
      }
    }
  });

  // only let to run one investment of the same strategy and mode
  if (investment_run) {
    let message = `Investment with ${strategy_type} strategy and ${
      is_simulated ? 'simulated' : 'real investment'
    } mode already created`;

    TE(message);
  }

  [err, investment_run] = await to(InvestmentRun.create({
    strategy_type: strategy_type,
    is_simulated: is_simulated,
    user_created_id: user_id,
    started_timestamp: new Date,
    updated_timestamp: new Date,
    status: INVESTMENT_RUN_STATUSES.Initiated
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
        [Op.eq]: RECIPE_RUN_STATUSES.Pending
      }
    }
  });

  if (recipe_run) TE("This investment run already has recipe pending approval");

  [err, investment_run] = await to(changeInvestmentRunStatus(
    investment_run_id, 
    INVESTMENT_RUN_STATUSES.RecipeRun
  ));
  if (err) TE(err.message);

  [err, recipe_run_detail] = await to(generateRecipeDetails(investment_run.strategy_type));
  if (err) TE(err.message);

  recipe_run = new RecipeRun({
    created_timestamp: new Date(),
    investment_run_id,
    user_created_id: user_id,
    approval_status: RECIPE_RUN_STATUSES.Pending,
    approval_comment: '',
  });

  [err, recipe_run] = await to(recipe_run.save());
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

  recipe_run = recipe_run.toJSON();
  recipe_run.recipe_run_details = recipe_run_detail;//.map(detail => detail.toJSON());

  return recipe_run;
};
module.exports.createRecipeRun = createRecipeRun;

const generateRecipeDetails = async function (strategy_type) {
  // get assets for recipe
  let err, assets, instruments;
  [err, assets] = await to(AssetService.getStrategyAssets(strategy_type));
  if (err) TE(err.message);

  let base_assets = (await Asset.findAll({
    where: {
      is_base: true
    }
  })).map(asset => asset.toJSON());
  base_assets[0].USD = 7576.56;
  base_assets[1].USD = 572.82;

  // check if assets meet liquidity requirements
  let possible_actions;
  [err, possible_actions] = await to(Promise.all(
    assets.map((asset) => {
      return AssetService.getAssetInstruments(asset.id);
    })
  ));

  if (err) TE(err.message);

  _.zipWith(assets, possible_actions, (a, b) => a.possible_actions = b);

  assets.map(asset => {
    if (typeof asset.possible_actions === 'undefined' || !asset.possible_actions)
      return {};

    if (asset.possible_actions.length &&
        asset.possible_actions.every((a) => a.average_volume < a.min_volume_requirement))
      TE('None of instruments for asset %s fulfill liquidity requirements', asset.symbol);

    asset.possible_actions = asset.possible_actions.map((instrument) => {
      let is_sell = instrument.transaction_asset_id!=asset.id;
      
      // get base asset price in usd
      let base_asset, base_asset_usd_price;
      if (base_asset = base_assets.find(ba => ba.id==(
        is_sell ? instrument.transaction_asset_id : instrument.quote_asset_id
      )))
        base_asset_usd_price = base_asset.USD;
      else
        TE("Didn't find base asset with id",
          is_sell ? instrument.transaction_asset_id : instrument.quote_asset_id
        );

      /* To find cheapest way to purchase asset first find out the price of asset in USD
       if it would be acquired this way. If it's a sell position, then invert price of
       bid order. */
      instrument.cost_usd = base_asset_usd_price * ( is_sell ? 
        1 / instrument.bid_price :
        instrument.ask_price);

      Object.assign(instrument, {
        is_sell
      });
      return instrument;
    });

    // find cheapest way to acquire asset
    asset.suggested_action = _.minBy(
      asset.possible_actions,
      'cost_usd'
    );
  });
    

  // calculate investment percentage based on market share
  let total_marketshare = 0;
  assets.filter(a => typeof a.suggested_action!=="undefined")
    .map((asset) => {
      total_marketshare += parseFloat(asset.avg_share);
      return asset;
    }).map(asset => {
      asset.investment_percentage = (100 / total_marketshare) * asset.avg_share;
    });

  return assets;
};

const changeRecipeRunStatus = async function (user_id, recipe_run_id, status_constant, comment) {
  // check for valid recipe run status
  if (!Object.values(RECIPE_RUN_STATUSES).includes(parseInt(status_constant, 10)))
    TE(`Unknown recipe run status ${status_constant}!`);

  if (!comment) TE('Comment not provided');

  let err, recipe_run;
  recipe_run = await RecipeRun.findById(recipe_run_id);
  
  if (!recipe_run) TE("Recipe run not found");

  Object.assign(recipe_run, {
    approval_status: status_constant,
    approval_user_id: user_id,
    approval_timestamp: new Date(),
    approval_comment: comment
  });

  [err, recipe_run] = await to(recipe_run.save());
  if (err) TE(err.message);

  return recipe_run;
};
module.exports.changeRecipeRunStatus = changeRecipeRunStatus;