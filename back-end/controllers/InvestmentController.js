'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const User = require('../models').User;
const adminViewsService = require('../services/AdminViewsService');
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

  
  investment_run = investment_run.toWeb();
  /*let mock_investment_run = Object.assign(investment_run, {
    user_created: 'Mock User'
  })*/

  investment_run = Object.assign(investment_run, {
    user_created: `${req.user.first_name} ${req.user.last_name}`
  })

  return ReS(res, {
    investment_run: mock_investment_run
  })
};
module.exports.createInvestmentRun = createInvestmentRun;

const createRecipeRun = async function (req, res) {

  let investment_run_id = req.params.investment_id,

    [err, recipe_run] = await to(
      investmentService.createRecipeRun(req.user.id, investment_run_id)
    );
  if (err) return ReE(res, err, 422);

  
  recipe_run = recipe_run.toJSON();
  /*let mock_recipe_run = Object.assign(recipe_run, {
    user_created: 'Mock User',
    approval_user: 'Mock User'
  })*/

  recipe_run = Object.assign(recipe_run, {
    user_created: `${req.user.first_name} ${req.user.last_name}`,
    approval_user: null
  });

  return ReS(res, {
    recipe_run: mock_recipe_run
  })
};
module.exports.createRecipeRun = createRecipeRun;

const getInvestmentRun = async function (req, res) {

  let investment_run_id = req.params.investment_id;
  let [err, investment_run] = await to(InvestmentRun.findById(investment_run_id,
    {
      include: [
        {
          model: RecipeRun
        },
        {
          model: User,
          attributes: ['first_name', 'last_name'],
          as: 'user_created'
        }
      ]
    }));

  if (err) return ReE(res, err.message, 422);

  investment_run = investment_run.toWeb();  
  /*let mock_investment_run = Object.assign(investment_run, {
    user_created: 'Mock User'
  })*/

  const { user_created } = investment_run;
  investment_run.user_created = `${user_created.first_name} ${user_created.last_name}`;

  return ReS(res, {
    investment_run
  })
};
module.exports.getInvestmentRun = getInvestmentRun;

const getInvestmentStats = async function(req, res) {

  // mock data below
  
  let mock_stats = {
    investment: {
      id: 2,
      status: 51,
      strategy_type: "12",
      timestamp: 1531989525768
    },
    recipe_run: {
      id: 2,
      status: 51,
      timestamp: 1531989525768
    },
    deposits: {
      count: 12,
      status: 123
    },
    orders: {
      count: 12,
      status: 123
    },
    execution_orders: {
      count: 12,
      status: 123
    }
  }

  return ReS(res, {
    statistics: mock_stats
  })
}
module.exports.getInvestmentStats = getInvestmentStats;

const getInvestmentRuns = async function (req, res) {

  /*let query = req.seq_query;

  let [err, results] = await to(InvestmentRun.findAndCountAll(query));
  if (err) return ReE(res, err.message, 422);

  let { rows: investment_runs, count } = results;

  // mock data added below NOT ANYMORE!

  let mock_investment_runs = investment_runs.map((investment, index) => {
    investment = investment.toJSON();
    return Object.assign(investment, {
      user_created: 'Mock User',
    })
  });

  let footer = [
    { "name": "id", "value": "15" },
    { "name": "started_timestamp", "value": "1531404392947" },
    { "name": "updated_timestamp", "value": "1531404392947" },
    { "name": "completed_timestamp", "value": "null" },
    { "name": "strategy_type", "value": "102" },
    { "name": "is_simulated", "value": "true" },
    { "name": "status", "value": "302" },
    { "name": "deposit_usd", "value": "399" },
    { "name": "user_created_id", "value": "2" },
  ]*/

  const { seq_query, sql_where } = req;

  let [ err, result ] = await to(adminViewsService.fetchInvestmentRunsViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);
  
  let footer = [];
  [err, footer] = await to(adminViewsService.fetchInvestmentRunsViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  let { data: investment_runs, total: count } = result;

  investment_runs = investment_runs.map(ir => ir.toWeb());

  return ReS(res, {
    investment_runs,
    footer,
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
  recipe_run.toWeb();
  let mock_recipe_run = Object.assign(recipe_run, {
    user_created: 'Mock User',
    approval_user: 'Mock User'
  })

  return ReS(res, {
    recipe_run: mock_recipe_run
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

  if (!recipe_run) 
    return ReE(res, "Recipe not found", 422);
  // mock data added below
  recipe_run.toWeb();
  let mock_recipe_run = Object.assign(recipe_run, {
    user_created: 'Mock User',
    approval_user: 'Mock User'
  })

  let countDetails = [
    { 
      name: "Orders",
      count: 999
    },
    { 
      name: "Execution Orders",
      count: 999
    },
    { 
      name: "Deposits",
      count: 999
    }
  ]

  return ReS(res, {
    recipe_run: mock_recipe_run,
    recipe_stats: countDetails
  })
};
module.exports.getRecipeRun = getRecipeRun;

const getRecipeRuns = async function (req, res) {

  let query = req.seq_query;
  let investment_id = req.params.investment_id;
  
  if (investment_id) {
    query.where.investment_run_id = investment_id;
  };

  let [err, results] = await to(RecipeRun.findAndCountAll(query));
  if (err) return ReE(res, err.message, 422);

  let { rows: recipe_runs, count } = results;

  // mock data below
  let mock_recipes = recipe_runs.map((recipe, index) => {
    recipe = recipe.toWeb();
    return Object.assign(recipe, {
      user_created: 'Mock User',
      approval_user: 'Mock User'
    })
  });

  let footer = create_mock_footer(mock_recipes[0], 'recipe_runs');

  return ReS(res, {
    recipe_runs: mock_recipes,
    footer,
    count
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
    "investment_percentage": "5.67945412594929",
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
    "id": index + 1,
    "investment_percentage": "55.67945412594929",
    "recipe_run_id": 5,
    "transaction_asset_id": 2,
    "quote_asset_id": 2,
    "target_exchange_id": 5,
    "transaction_asset": "BTC",
    "quote_asset": "XRP",
    "target_exchange": "bitstamp"
  }));

  let footer = create_mock_footer(mock_detail[0], 'recipe_details');

  return ReS(res, {
    recipe_details: mock_detail,
    footer,
    count: 20
  })
};
module.exports.getRecipeRunDetails = getRecipeRunDetails;


const getRecipeOrder = async function (req, res) {

  // mock data below

  let mock_detail = {
    id: 1,
    recipe_order_group_id: "31",
    instrument_id: "12",
    instrument_name: "BTC/ETH",
    side: "999",
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
    id: index + 1,
    recipe_order_group_id: "31",
    instrument_id: "12",
    instrument_name: "BTC/XRP",
    side: "999",
    price: 100,
    quantity: 7,
    status: 51,
    sum_of_exhange_trading_fee: 100,

  }));

  let footer = create_mock_footer(mock_detail[0], 'orders');

  return ReS(res, {
    recipe_orders: mock_detail,
    footer,
    count: 10
  })
};
module.exports.getRecipeOrders = getRecipeOrders;


const getRecipeDeposit = async function (req, res) {

  // mock data below

  let mock_detail = {
    id: 1,
    transaction_asset_id: 2,
    exchange_id: 1,
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
    transaction_asset_id: 2,
    exchange_id: 1,
    transaction_asset: "BTC",
    exchange: "BITSTAMP",
    account: "1541154",
    amount: 165165,
    investment_percentage: 64,
    status: 150,
  }));

  let footer = create_mock_footer(mock_detail[0], 'deposits');


  return ReS(res, {
    recipe_deposits: mock_detail,
    footer,
    count: 20
  })
};
module.exports.getRecipeDeposits = getRecipeDeposits;


const getExecutionOrder = async function (req, res) {

  // mock data below

  let mock_detail = {
    id: 1,
    instrument: "BTC/ETH",
    side: 999,
    type: 71,
    price: 12.01,
    total_quantity: 6.01,
    exchange_trading_fee: 1.01,
    status: 61,
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
    side: 999,
    type: 71,
    price: 12.01,
    total_quantity: 6.01,
    exchange_trading_fee: 1.01,
    status: 61,
    submission_time: 1531396477062,
    completion_time: 1531396477062
  }));

  let footer = create_mock_footer(mock_detail[0], 'execution_order');

  return ReS(res, {
    execution_orders: mock_detail,
    footer,
    count: 20
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

  let footer = create_mock_footer(mock_detail[0], 'execution_order_fill');

  return ReS(res, {
    execution_order_fills: mock_detail,
    footer: footer,
    count: 20
  })
};
module.exports.ExecutionOrderFills = ExecutionOrderFills;

const create_mock_footer = function (keys, name) {
  // delete this function after mock data is replaced
  let footer = [...Object.keys(keys)].map((key, index) => {
    return {
      "name": key,
      "value": 999,
      "template": name + ".footer." + key,
      "args": {
          [key]: 999
      }
    }
  });
  return footer;
};