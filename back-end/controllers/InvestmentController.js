'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const User = require('../models').User;
const adminViewsService = require('../services/AdminViewsService');
const adminViewUtils = require('../utils/AdminViewUtils');
const investmentService = require('../services/InvestmentService');
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
  
  recipe_run = recipe_run.toJSON();

  return ReS(res, {
    recipe_run: recipe_run
  })
};
module.exports.createRecipeRun = createRecipeRun;

const getInvestmentRun = async function (req, res) {

  let investment_run_id = req.params.investment_id;
  let [err, investment_run] = await to(adminViewsService.fetchInvestmentRunView(investment_run_id));

  if (err) return ReE(res, err.message, 422);
  if (!investment_run) return ReE(res, `Investment run not found with id: ${investment_run_id}`, 422);

  investment_run = investment_run.toWeb();  

  return ReS(res, {
    investment_run
  });
};
module.exports.getInvestmentRun = getInvestmentRun;

const getInvestmentStats = async function(req, res) {

  let [err, investment_run] = await to(investmentService.findInvestmentRunFromAssociations(req.body));
  if (err) return ReE(res, err, 422);

  if (!investment_run) return ReE(res, "Investment run not found!");

  let timeline;
  [err, timeline] = await to(investmentService.getInvestmentRunTimeline(investment_run.id));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    timeline
  })
}
module.exports.getInvestmentStats = getInvestmentStats;

const getInvestmentRuns = async function (req, res) {

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

const getInvestmentRunsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(adminViewsService.fetchInvestmentRunsViewHeaderLOV(field_name, query, req.sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

};
module.exports.getInvestmentRunsColumnLOV = getInvestmentRunsColumnLOV;

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
  recipe_run = recipe_run.toWeb();

  let user_created = {};
  [ err, user_created ] = await to(User.findById(recipe_run.user_created_id));
  if(err) return ReE(res, err.message, 422);

  recipe_run = Object.assign(recipe_run, {
    user_created: user_created.fullName(),
    approval_user: req.user.fullName()
  })

  return ReS(res, {
    recipe_run
  })
};
module.exports.changeRecipeRunStatus = changeRecipeRunStatus;

const getRecipeRun = async function (req, res) {

  let recipe_run_id = req.params.recipe_id;
  let [ err, recipe_run ] = await to(adminViewsService.fetchRecipeRunView(recipe_run_id));
  if (err) return ReE(res, err.message, 422);

  if (!recipe_run) 
    return ReE(res, "Recipe not found", 422);
 
  recipe_run.toWeb();

  return ReS(res, {
    recipe_run
  })
};
module.exports.getRecipeRun = getRecipeRun;

const getRecipeRuns = async function (req, res) {

  let { seq_query, sql_where } = req;
  const investment_id = req.params.investment_id;
  
  if (investment_id) {
    seq_query.where.investment_run_id = investment_id;
  };

  let err, result;

  [ err, result ] = await to(adminViewsService.fetchRecipeRunsViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  let footer = [];
  [ err, footer ] = await to(adminViewsService.fetchRecipeRunsViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  let { data: recipe_runs, total: count } = result;

  recipe_runs = recipe_runs.map(rr => rr.toWeb());

  return ReS(res, {
    recipe_runs,
    footer,
    count
  });
};
module.exports.getRecipeRuns = getRecipeRuns;

const getRecipeRunsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(adminViewsService.fetchRecipeRunsViewHeaderLOV(field_name, query, sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

};
module.exports.getRecipeRunsColumnLOV = getRecipeRunsColumnLOV;

const getRecipeRunDetail = async function (req, res) {

  const recipe_detail_id = req.params.recipe_detail_id;

  const [ err, recipe_detail ] = await to(adminViewsService.fetchRecipeRunDetailView(recipe_detail_id));
  if(err) return ReE(res, err.message, 422);
  if(!recipe_detail) return ReE(res, `Recipe detail was not found with id ${recipe_detail_id}`, 422);

  return ReS(res, {
    recipe_detail
  })
};
module.exports.getRecipeRunDetail = getRecipeRunDetail;


const getRecipeRunDetails = async function (req, res) {

  let recipe_run_id = req.params.recipe_id;

  let { seq_query, sql_where } = req;

  if(recipe_run_id && _.isPlainObject(seq_query)) {
    if(!_.isPlainObject(seq_query)) seq_query = { where: {} };
    if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
    seq_query.where.recipe_run_id = recipe_run_id;
    sql_where = adminViewUtils.addToWhere(sql_where, `recipe_run_id=${recipe_run_id}`);
  }
  

  let [ err, result ] = await to(adminViewsService.fetchRecipeRunDetailsViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  let footer = [];
  [ err, footer ] = await to(adminViewsService.fetchRecipeRunDetailsViewFooter(sql_where));  
  if(err) return ReE(res, err.message, 422);

  const { data: recipe_details, total: count } = result;

  return ReS(res, {
    recipe_details,
    footer,
    count
  })
};
module.exports.getRecipeRunDetails = getRecipeRunDetails;

const getRecipeRunDetailsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(adminViewsService.fetchRecipeRunDetailsViewHeaderLOV(field_name, query, req.sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

};
module.exports.getRecipeRunDetailsColumnLOV = getRecipeRunDetailsColumnLOV;


const getExecutionOrder = async function (req, res) {

  //This will replace the mock data once the fees are resolved.
  const execution_order_id = req.params.order_detail_id;

  let [ err, execution_order ] = await to(adminViewsService.fetchExecutionOrderView(execution_order_id));
  if(err) return ReE(res, err.message, 422);
  if(!execution_order) return ReE(res, `Can't find execution order for id ${execution_order_id}`, 404);

  execution_order = execution_order.toWeb();

  return ReS(res, {
    execution_order
  })
};
module.exports.getExecutionOrder = getExecutionOrder;

const getExecutionOrders = async function (req, res) {

  const { seq_query, sql_where } = req;

  let [ err, result ] = await to(adminViewsService.fetchExecutionOrdersViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);
  
  let footer = [];
  [err, footer] = await to(adminViewsService.fetchExecutionOrdersViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  let { data: execution_orders, total: count } = result;

  execution_orders = execution_orders.map(eo => eo.toWeb());

  return ReS(res, {
    execution_orders,
    footer,
    count
  })

}
module.exports.getExecutionOrders = getExecutionOrders;

const getExecutionOrdersOfRecipeOrder = async function (req, res) {

  let { seq_query, sql_where } = req;
  const recipe_order_id = req.params.order_detail_id;

  if(recipe_order_id) {
    if(!_.isPlainObject(seq_query)) seq_query = { where: {} };
    if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
    seq_query.where.recipe_order_id = recipe_order_id;
    sql_where = adminViewUtils.addToWhere(sql_where, `recipe_order_id = ${recipe_order_id}`);
  } else {
    return ReE(res, `Valid order id not found in path! saw ${recipe_order_id}`)
  }

  let [ err, result ] = await to(adminViewsService.fetchExecutionOrdersViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  let footer = [];
  [ err, footer ] = await to(adminViewsService.fetchExecutionOrdersViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  let { data: execution_orders, total: count } = result;
  
  execution_orders = execution_orders.map(eo => eo.toWeb())

  return ReS(res, {
    execution_orders,
    footer,
    count
  })
};
module.exports.getExecutionOrdersOfRecipeOrder = getExecutionOrdersOfRecipeOrder;

const getExecutionOrdersOfInvestmentRun = async function (req, res) {

  let { seq_query, sql_where } = req;
  const investment_run_id = req.params.investment_run_id;

  if(investment_run_id) {
    if(!_.isPlainObject(seq_query)) seq_query = { where: {} };
    if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
    seq_query.where.investment_run_id = investment_run_id;
    sql_where = adminViewUtils.addToWhere(sql_where, `investment_run_id = ${investment_run_id}`);
  } else {
    return ReE(res, `Valid investment run id not found in path! saw: ${investment_run_id}`)
  }

  let [ err, result ] = await to(adminViewsService.fetchExecutionOrdersViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  let footer = [];
  [ err, footer ] = await to(adminViewsService.fetchExecutionOrdersViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  let { data: execution_orders, total: count } = result;
  
  execution_orders = execution_orders.map(eo => eo.toWeb())

  return ReS(res, {
    execution_orders,
    footer,
    count
  })
};
module.exports.getExecutionOrdersOfInvestmentRun = getExecutionOrdersOfInvestmentRun;

const getExecutionOrdersColumnLOV = async function (req, res) {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(adminViewsService.fetchExecutionOrdersViewHeaderLOV(field_name, query, req.sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

};
module.exports.getExecutionOrdersColumnLOV = getExecutionOrdersColumnLOV;


const getExecutionOrderFill = async function (req, res) {

    const execution_order_fill_id = req.params.exec_order_fill_id;

    const execution_order_fill = await adminViewsService.fetchExecutionOrderFillView(execution_order_fill_id);

    return ReS(res, {
      execution_order_fill
    })
};
module.exports.getExecutionOrderFill = getExecutionOrderFill;

const getExecutionOrderFills = async function (req, res) {

  const execution_order_id = req.params.execution_order_id;

  let seq_query = Object.assign({}, req.seq_query);
  seq_query.where.execution_order_id = execution_order_id;

  const sql_where = adminViewUtils.addToWhere(req.sql_where, `execution_order_id = ${execution_order_id}`);

  const { data: execution_order_fills, total: count} = await adminViewsService.fetchExecutionOrderFillsViewDataWithCount(seq_query);
  const footer = await adminViewsService.fetchExecutionOrderFillsViewsFooter(sql_where);

  const execution_order_fills_web = _.map(execution_order_fills, eof => eof.toWeb());

  return ReS(res, {
    execution_order_fills: execution_order_fills_web,
    footer,
    count
  })
};
module.exports.getExecutionOrderFills = getExecutionOrderFills;


const getExecutionOrderFillsColumnLOV = async function (req, res) {

  const field_name = req.params.field_name
  const { query } = _.isPlainObject(req.body)? req.body : { query: '' };

  const field_vals = await adminViewsService.fetchExecutionOrderFillsViewHeaderLOV(field_name, query, req.sql_where);

  return ReS(res, {
    query: query,
    lov: field_vals
  })
}
module.exports.getExecutionOrderFillsColumnLOV = getExecutionOrderFillsColumnLOV;


const GetInvestmentPortfolioStats = async function (req, res) {

  // mock data below
  let subb_months = [2, 3, 4];
  let subscription_amount = subb_months.map(m => {
    return [
      {
        month: m,
        year: 2018,
        portfolio: "MCI",
        subscription: 9000 + (Math.random() * 10000)
      },
      {
        month: m,
        year: 2018,
        portfolio: "LCI",
        subscription: 11000 + (Math.random() * 10000)
      }
    ]
  });

  // generates random data
  let currencies = ['BTC', 'ETH', 'LTC', 'BCH', 'XRP', 'EOS', 'XLM', 'ADA', 'USDT', 'Others'];
  let mci_portfolio = currencies.map((c, index) => {
    return ({
      symbol: c,
      amount: 20000 + (Math.random() * 10000)
    })
  });

  let market_port_time = [3, 4, 5, 6, 7];
  let port_value = 4000;
  let portfolio_value = market_port_time.map(month => {
    return {
      month: month,
      year: 2018,
      value: port_value *= (1 + 0.5 * Math.random())
    }
  });

  return ReS(res, {
    subscription_amount,
    mci_portfolio,
    market_value: portfolio_value
  })
}
module.exports.GetInvestmentPortfolioStats = GetInvestmentPortfolioStats;