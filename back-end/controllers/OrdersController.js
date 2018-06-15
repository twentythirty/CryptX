'use strict';

const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeOrder = require('../models').RecipeOrder;
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