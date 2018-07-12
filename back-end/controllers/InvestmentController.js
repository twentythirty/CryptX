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

  /* [err, recipe_run] = await to(
    investmentService.createRecipeRun(req.user.id, investment_run.id, strategy_type)
  );
  if (err) return ReE(res, err, 422); */

  return ReS(res, {
    investment_run: investment_run.toWeb()
  })
};
module.exports.createInvestmentRun = createInvestmentRun;

const createRecipeRun = async function (req, res) {

  let investment_run_id = req.params.investment_id,

  [err, recipe_run] = await to(
    investmentService.createRecipeRun(req.user.id, investment_run_id)
  );
  if (err) return ReE(res, err, 422);

  // mock data added below
  recipe_run.toJSON();
  recipe_run = Object.assign(recipe_run, { 
    user_created: 'Mock User',
    approval_user: 'Mock User'
  })

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

    // mock data added below
  recipe_run.toJSON();
  recipe_run = Object.assign(recipe_run, { 
    user_created: 'Mock User',
    approval_user: 'Mock User'
  })

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

    // mock data added below
  recipe_run.toJSON();
  recipe_run = Object.assign(recipe_run, { 
    user_created: 'Mock User',
    approval_user: 'Mock User'
  })

  return ReS(res, {
    recipe_run: recipe_run
  })
};
module.exports.getRecipeRun = getRecipeRun;

const getRecipeRuns = async function (req, res) {

  let query = req.seq_query;
  let investment_id = req.params.investment_id;

  let [err, results] = await to(RecipeRun.findAndCountAll(query));
  if (err) return ReE(res, err.message, 422);

  let { rows: recipe_runs, count } = results;
  
  // mock data below
  let mock_recipes = [...Array(20)].map((recipe, index) => {
    return {
      "id": index,
      "created_timestamp": 1529926807127,
      "approval_status": 42,
      "approval_timestamp": 1529926807127,
      "approval_comment": "Don't do it",
      "investment_run_id": investment_id,
      "user_created_id": 2,
      "user_created": "John Doe",
      "approval_user_id": 2,
      "approval_user": "John Doe"
    };
  });
  
  return ReS(res, {
    recipe_runs: mock_recipes,
    count: 20
  });
};
module.exports.getRecipeRuns = getRecipeRuns;

const getRecipeRunDetail = async function (req, res) {

  /* let recipe_detail_id = req.params.recipe_detail_id;

  let [err, recipe_run_detail] = await to(RecipeRunDetail.findOne({
    where: {
      id: recipe_detail_id
    }
  }));

  if (err) return ReE(res, err.message, 422);
  if (recipe_run_detail)
    return ReE(res, "Recipe detail not found", 422) */
  // mock data below
  let recipe_run_detail = {
    "id": 1,
    "investment_percentage": "55.67945412594929",
    "recipe_run_id": 5,
    "transaction_asset_id": 2,
    "quote_asset_id": 2,
    "target_exchange_id": 5,
    "transaction_asset": "BTC",
    "quote_asset": "XRP",
    "target_exchange": "bitstamp"
}

  return ReS(res, {
    recipe_detail: recipe_run_detail
  })
};
module.exports.getRecipeRunDetail = getRecipeRunDetail;


const getRecipeRunDetails = async function (req, res) {

  let recipe_run_id = req.params.recipe_id;

  let [err, recipe_run_details] = await to(RecipeRunDetail.findAll({
    where: {
      recipe_run_id: recipe_run_id
    }
  }));

  if (err) return ReE(res, err.message, 422);

  // mock data below
  
  let mock_detail = [...Array(20)].map((detail, index) => ({
      "id": index+1,
      "investment_percentage": "55.67945412594929",
      "recipe_run_id": 5,
      "transaction_asset_id": 2,
      "quote_asset_id": 2,
      "target_exchange_id": 5,
      "transaction_asset": "BTC",
      "quote_asset": "XRP",
      "target_exchange": "bitstamp"
  }));

  return ReS(res, {
    recipe_details: mock_detail
  })
};
module.exports.getRecipeRunDetails = getRecipeRunDetails;


const getRecipeOrder = async function (req, res) {

  // mock data below
  
  let mock_detail = {
    id: 1,
    recipe_order_group_id: "",
    instrument_id: "",
    side: "buy",
    price: 100,
    quantity: 7,
    status: 51,
    sum_of_exhange_trading_fee: 100
  };

  return ReS(res, {
    recipe_order: mock_detail
  })
};
module.exports.getRecipeOrder = getRecipeOrder;


const getRecipeOrders = async function (req, res) {

  // mock data below
  
  let mock_detail = [...Array(20)].map((detail, index) => ({
    id: index+1,
    recipe_order_group_id: "",
    instrument_id: "",
    side: "buy",
    price: 100,
    quantity: 7,
    status: 51,
    sum_of_exhange_trading_fee: 100
  }));

  return ReS(res, {
    recipe_orders: mock_detail
  })
};
module.exports.getRecipeOrders = getRecipeOrders;


const getRecipeDeposit = async function (req, res) {

  // mock data below
  
  let mock_detail = {
    id: 1,
    transaction_asset: "BTC",
    exchange: "BITSTAMP",
    account: "1541154",
    amount: 165165,
    investment_percentage: 64,
    status: 150,
  };

  return ReS(res, {
    recipe_deposit: mock_detail
  })
};
module.exports.getRecipeDeposit = getRecipeDeposit;


const getRecipeDeposits = async function (req, res) {

  // mock data below
  
  let mock_detail = [...Array(20)].map((detail, index) => ({
    id: index,
    transaction_asset: "BTC",
    exchange: "BITSTAMP",
    account: "1541154",
    amount: 165165,
    investment_percentage: 64,
    status: 150,
  }));

  return ReS(res, {
    recipe_deposits: mock_detail
  })
};
module.exports.getRecipeDeposits = getRecipeDeposits;


const getExecutionOrder = async function (req, res) {

  // mock data below
  
  let mock_detail = {
    id: 1,
    instrument: "BTC/ETH",
    side: "buy",
    type: "market",
    price: 12.01,
    total_quantity: 6.01,
    exchange_trading_fee: 1.01,
    status: "Pending",
    submission_time: 1531396477062,
    completion_time: 1531396477062
  };

  return ReS(res, {
    execution_order: mock_detail
  })
};
module.exports.getExecutionOrder = getExecutionOrder;


const getExecutionOrders = async function (req, res) {

  // mock data below
  let mock_detail = [...Array(20)].map((detail, index) => ({
    id: index,
    instrument: "BTC/ETH",
    side: "buy",
    type: "market",
    price: 12.01,
    total_quantity: 6.01,
    exchange_trading_fee: 1.01,
    status: "Pending",
    submission_time: 1531396477062,
    completion_time: 1531396477062
  }));

  return ReS(res, {
    execution_orders: mock_detail
  })
};
module.exports.getExecutionOrders = getExecutionOrders;


const ExecutionOrderFill = async function (req, res) {

  // mock data below
  
  let mock_detail = {
    id: 1,
    fill_time: 1531396477062,
    fill_price: 10.05,
    quantity: 3
  }

  return ReS(res, {
    execution_order_fill: mock_detail
  })
};
module.exports.ExecutionOrderFill = ExecutionOrderFill;

const ExecutionOrderFills = async function (req, res) {

  // mock data below
  
  let mock_detail = [...Array(20)].map((detail, index) => ({
    id: index,
    fill_time: 1531396477062,
    fill_price: 10.05,
    quantity: 3
  }));

  return ReS(res, {
    execution_order_fills: mock_detail
  })
};
module.exports.ExecutionOrderFills = ExecutionOrderFills;