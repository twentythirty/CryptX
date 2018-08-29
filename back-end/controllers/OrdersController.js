'use strict';

const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeOrder = require('../models').RecipeOrder;
const RecipeRun = require('../models').RecipeRun;
const adminViewUtils = require('../utils/AdminViewUtils');
const adminViewsService = require('../services/AdminViewsService');
const ordersService = require('../services/OrdersService');

const getOrdersGroup = async (req, res) => {

    let recipe_run_id = req.params.recipe_run_id;

    const recipe_order_group = await RecipeOrderGroup.findOne({
        where: {
            recipe_run_id: recipe_run_id
        },
        include: [RecipeOrder]
    });

    if (recipe_order_group == null) {
        return ReE(res, `Orders group not found for recipe run id ${recipe_run_id}`, 404);
    }

    return ReS(res, recipe_order_group, 200);
};
module.exports.getOrdersGroup = getOrdersGroup;


const changeOrdersGroupStatus = async (req, res) => {
    //extract order group id
    const order_group_id = req.params.order_group_id,
        user_id = req.user.id;
    //extract body params
    let {
        status,
        comment
    } = req.body;

    let [err, result] = await to(ordersService.changeRecipeOrderGroupStatus(
        user_id, order_group_id, status, comment
    ), false);

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        message: "OK!"
    }, 200);
};
module.exports.changeOrdersGroupStatus = changeOrdersGroupStatus;

const generateRecipeRunOrders = async (req, res) => {

    const recipe_run_id = req.params.recipe_run_id;

    const recipe_run = await RecipeRun.findById(recipe_run_id);
    if (recipe_run == null) {

        return ReE(res, `Recipe run with id ${recipe_run_id} not found!`, 404);
    }
    if (recipe_run.approval_status != RECIPE_RUN_STATUSES.Approved) {

        return ReE(res, `Recipe run ${recipe_run_id} in invalid state! Should be ${RECIPE_RUN_STATUSES.Approved} but was ${recipe_run.approval_status}.`, 422);
    }

    let [err, result] = await to(ordersService.generateApproveRecipeOrders(recipe_run_id))

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, result, 200);
};
module.exports.generateRecipeRunOrders = generateRecipeRunOrders;

const getRecipeOrder = async function (req, res) {

    //This will replace the mock data once we know how to calculate the sum of fees.
    const recipe_order_id = req.params.order_id;
  
    let [ err, recipe_order ] = await to(adminViewsService.fetchRecipeOrderView(recipe_order_id));
    if(err) return ReE(res, err.message, 422);
    if(!recipe_order) return ReE(res, `Order not found for id ${recipe_order_id}`, 404);
  
    recipe_order = recipe_order.toWeb();
  
    return ReS(res, {
      recipe_order
    })
  };
  module.exports.getRecipeOrder = getRecipeOrder;

  const getRecipeOrders = async function(req, res) {

    let { seq_query, sql_where } = req;
  
    let [ err, result ] = await to(adminViewsService.fetchRecipeOrdersViewDataWithCount(seq_query));
    if(err) return ReE(res, err.message, 422);
  
    let footer = [];
    [ err, footer ] = await to(adminViewsService.fetchRecipeOrdersViewFooter(sql_where));
    if(err) return ReE(res, err.message, 422);
  
    let { data: recipe_orders, total: count } = result;
    
    recipe_orders = recipe_orders.map(ro => ro.toWeb());
  
    return ReS(res, {
      recipe_orders,
      footer,
      count
    })
  }
  module.exports.getRecipeOrders = getRecipeOrders;

  const getRecipeOrdersGroupOfRecipe = async function(req, res) {

    const recipe_run_id = req.params.recipe_id;
    const is_check = !_.isUndefined(req.query.check) && (req.query.check == 'true');

    const [ err, recipe_order_group ] = await to(adminViewsService.fetchRecipeOrdersGroupView(null, parseInt(recipe_run_id)));
    if(err) return ReE(res, err.message, 422);
    if (!recipe_order_group && !is_check) {
        const response_message = `Order group of recipe run with id ${recipe_run_id} was not found`;
        return ReE(res, response_message, 404);
    }

    return ReS(res, {
        recipe_order_group: recipe_order_group != null ? recipe_order_group.toWeb() : null
    })
  }
  module.exports.getRecipeOrdersGroupOfRecipe = getRecipeOrdersGroupOfRecipe;


  const getRecipeOrdersGroup = async function(req, res) {

    const recipe_order_group_id = req.params.order_group_id;

    let [ err, recipe_order_group ] = await to(adminViewsService.fetchRecipeOrdersGroupView(parseInt(recipe_order_group_id), null));
    if(err) 
        return ReE(res, err.message, 422);
    if(!recipe_order_group) {
        let response_message = '';
        if(recipe_order_group_id) response_message = `Order group with id ${recipe_order_group_id} was not found.`;
        return ReE(res, response_message, 404);
    }
  
    recipe_order_group = recipe_order_group.toWeb();

    return ReS(res, {
        recipe_order_group
    })
  }
  module.exports.getRecipeOrdersGroup = getRecipeOrdersGroup;

  const getRecipeOrdersOfGroup = async function(req, res) {

    let { seq_query, sql_where } = req;
    const orders_group_id = req.params.recipe_order_group_id;
  
    if(orders_group_id) {
      if(!_.isPlainObject(seq_query)) seq_query = { where: {} };
      if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
      seq_query.where.recipe_order_group_id = orders_group_id;
      sql_where = adminViewUtils.addToWhere(sql_where, `recipe_order_group_id = ${orders_group_id}`);
    } else {

        return ReE(res, "missing recipe_order_group_id in path!", 404);
    }
  
    let [ err, result ] = await to(adminViewsService.fetchRecipeOrdersViewDataWithCount(seq_query));
    if(err) return ReE(res, err.message, 422);
  
    let footer = [];
    [ err, footer ] = await to(adminViewsService.fetchRecipeOrdersViewFooter(sql_where));
    if(err) return ReE(res, err.message, 422);
  
    let { data: recipe_orders, total: count } = result;
    
    recipe_orders = recipe_orders.map(ro => ro.toWeb());
  
    return ReS(res, {
      recipe_orders,
      footer,
      count
    })
  }
  module.exports.getRecipeOrdersOfGroup = getRecipeOrdersOfGroup;
  
  
  const getRecipeOrdersOfRecipe = async function (req, res) {
  
    //This will replace the mock data once we know how to calculate the sum of fees.
    let { seq_query, sql_where } = req;
    const recipe_id = req.params.recipe_run_id;
  
    if(recipe_id) {
      if(!_.isPlainObject(seq_query)) seq_query = { where: {} };
      if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
      seq_query.where.recipe_run_id = recipe_id;
      sql_where = adminViewUtils.addToWhere(sql_where, `recipe_run_id = ${recipe_id}`);
    } else {

        return ReE(res, "missing recipe_id in path!", 404);
    }
  
    let [ err, result ] = await to(adminViewsService.fetchRecipeOrdersViewDataWithCount(seq_query));
    if(err) return ReE(res, err.message, 422);
  
    let footer = [];
    [ err, footer ] = await to(adminViewsService.fetchRecipeOrdersViewFooter(sql_where));
    if(err) return ReE(res, err.message, 422);
  
    let { data: recipe_orders, total: count } = result;
    
    recipe_orders = recipe_orders.map(ro => ro.toWeb());
  
    return ReS(res, {
      recipe_orders,
      footer,
      count
    })
  };
  module.exports.getRecipeOrdersOfRecipe = getRecipeOrdersOfRecipe;
  
  const getRecipeOrdersColumnLOV = async function (req, res) {
  
    const field_name = req.params.field_name;
    const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };
  
    const [ err, field_vals ] = await to(adminViewsService.fetchRecipeOrdersViewHeaderLOV(field_name, query, req.sql_where));
    if(err) return ReE(res, err.message, 422);
  
    return ReS(res, {
      query: query,
      lov: field_vals
    })
  
  };
  module.exports.getRecipeOrdersColumnLOV = getRecipeOrdersColumnLOV;