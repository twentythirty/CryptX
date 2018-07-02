'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const investmentService = require('../services/InvestmentService');
const DepositService = require('../services/DepositService');
const OrdersService = require('../services/OrdersService');

const createInvestmentRun = async function (req, res) {
  let err, investment_run = {}, recipe_run;

  let { strategy_type,
    is_simulated,
    deposit_usd
  } = req.body;

  [err, investment_run] = await to(
    investmentService.createInvestmentRun(req.user.id, strategy_type, is_simulated, deposit_usd)
  );
  if (err) return ReE(res, err, 422);

  [err, recipe_run] = await to(
    investmentService.createRecipeRun(req.user.id, investment_run.id, strategy_type)
  );
  if (err) return ReE(res, err, 422);

  return ReS(res, {
    investment_run: investment_run,
    recipe: recipe_run
  })
};
module.exports.createInvestmentRun = createInvestmentRun;

const createRecipeRun = async function (req, res) {

  let investment_run_id = req.params.investment_id,

  [err, recipe_run] = await to(
    investmentService.createRecipeRun(req.user.id, investment_run_id)
  );
  if (err) return ReE(res, err, 422);

  return ReS(res, {
    recipe_run: recipe_run
  })
};
module.exports.createRecipeRun = createRecipeRun;

const getInvestmentRun = async function (req, res) {
  
  let investment_run_id = req.params.investment_id;
  let [err, investment_run] = await to(InvestmentRun.findById(investment_run_id,
  {
    include: RecipeRun
  }));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    investment_run: investment_run
  })
};
module.exports.getInvestmentRun = getInvestmentRun;

const getInvestmentRuns = async function (req, res) {

  let query = req.seq_query;

  let [err, results] = await to(InvestmentRun.findAndCountAll(query));
  if (err) return ReE(res, err.message, 422);

  let { rows: investment_runs, count } = results;
  return ReS(res, {
    investment_runs: investment_runs,
    count
  })
};
module.exports.getInvestmentRuns = getInvestmentRuns;

const changeRecipeRunStatus = async function (req, res) {

  let user_id = req.user.id,
    recipe_id = req.params.recipe_id,
    status = req.body.status,
    comment = req.body.comment;

  let [err, recipe_run] = await to(investmentService.changeRecipeRunStatus(
    user_id, recipe_id, status, comment
  ));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    recipe_run: recipe_run
  })
};
module.exports.changeRecipeRunStatus = changeRecipeRunStatus;

const addDeposit = async function (req, res) {

  let investment_run_id = req.params.investment_id,
    asset_id = req.body.asset_id,
    amount = req.body.amount;

  let [err, deposit] = await to(DepositService.saveDeposit(investment_run_id, asset_id, amount));
  if (err) return ReE(res, err.message);

  return ReS(res, {
    deposit
  });
}
module.exports.addDeposit = addDeposit;


const getRecipeRun = async function (req, res) {

  let recipe_run_id = req.params.recipe_id;
  let [err, recipe_run] = await to(RecipeRun.findById(recipe_run_id));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    recipe_run: recipe_run
  })
};
module.exports.getRecipeRun = getRecipeRun;

const getRecipeRuns = async function (req, res) {

  let query = req.seq_query;

  console.log(query);

  let [err, results] = await to(RecipeRun.findAndCountAll(query));
  if (err) return ReE(res, err.message, 422);

  let { rows: recipe_runs, count } = results;
  return ReS(res, {
    recipe_runs: recipe_runs,
    count
  })
};
module.exports.getRecipeRuns = getRecipeRuns;


const getRecipeRunDetails = async function (req, res) {

  let recipe_run_id = req.params.recipe_id;

  let [err, recipe_run_details] = await to(RecipeRunDetail.findAll({
    where: {
      recipe_run_id: recipe_run_id
    }
  }));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    recipe_details: recipe_run_details
  })
};
module.exports.getRecipeRunDetails = getRecipeRunDetails;
