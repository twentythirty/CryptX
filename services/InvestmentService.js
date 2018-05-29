'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const User = require('../models').User;
const AssetService = require('../services/AssetService');
const Op = require('sequelize').Op;

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
      status: {
        [Op.ne]: INVESTMENT_RUN_STATUSES.RunCompleted
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

const createRecipeRun = async function (user_id, investment_run_id, strategy_type) {
  let err, recipe_run, assets, recipe_run_detail;
  
  recipe_run = await RecipeRun.findOne({
    where: {
      investment_run_id: investment_run_id,
      approval_status: {
        [Op.eq]: RECIPE_RUN_STATUSES.Pending
      }
    }
  });

  if (recipe_run) TE("There's already a recipe pending approval");

  recipe_run = new RecipeRun({
    created_timestamp: new Date(),
    investment_run_id,
    user_created_id: user_id,
    approval_status: RECIPE_RUN_STATUSES.Pending,
    approval_comment: '',
  });

  [err, recipe_run] = await to(recipe_run.save());
  if (err) TE(err.message);

  // get assets for recipe
  [err, assets] = await to(AssetService.getStrategyAssets(strategy_type));
  if (err) TE(err.message);

  // fill recipe_run_details with results from getStrategyAssets
  [err, recipe_run_detail] = await to(Promise.all(
    assets.map(asset => {
      return RecipeRunDetail.create({
        recipe_run_id: recipe_run.id,
        transaction_asset_id: asset.transaction_asset_id,
        quote_asset_id: asset.id,
        target_exchange_id: asset.exchange_id,
        investment_percentage: asset.investment_percentage
      });
    })
  ));

  if (err) TE(err.message);

  recipe_run.recipe_run_details = recipe_run_detail;

  return recipe_run;
};
module.exports.createRecipeRun = createRecipeRun;

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