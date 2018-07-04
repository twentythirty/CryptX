'use strict';

const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeOrder = require('../models').RecipeOrder;
const RecipeRun = require('../models').RecipeRun;
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
    ));

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

        return ReE(res, `Recipe run ${recipe_run_id} in invalid state! Should be approved but was ${recipe_run.approval_status}.`, 422);
    }

    let [err, result] = await to(ordersService.generateApproveRecipeOrders(recipe_run_id))

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, result, 200);
};
module.exports.generateRecipeRunOrders = generateRecipeRunOrders;