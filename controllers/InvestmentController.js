'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const investmentService = require('../services/InvestmentService');
const DepositService = require('../services/DepositService');
const OrdersService = require('../services/OrdersService');

const createInvestmentRun = async function (req, res) {
  let err, investment_run = {}, recipe_run;

  let strategy_type = req.body.strategy_type;
  let is_simulated = req.body.is_simulated;

  [err, investment_run] = await to(
    investmentService.createInvestmentRun(req.user.id, strategy_type, is_simulated)
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
  let investment_run = await InvestmentRun.findById(investment_run_id);

  return ReS(res, {
    investment_run: investment_run
  })
};
module.exports.getInvestmentRun = getInvestmentRun;

const getInvestmentRuns = async function (req, res) {

  let investment_runs = await InvestmentRun.findAll({
    where: req.seq_where
  });

  return ReS(res, {
    investment_runs: investment_runs
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

  //if the recipe run is approved, try generate orders out of it
  if (status === RECIPE_RUN_STATUSES.Approved) {
    OrdersService.generateApproveRecipeOrders(recipe_run.id);
  }

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