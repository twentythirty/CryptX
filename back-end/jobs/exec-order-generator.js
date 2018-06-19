'use strict';

//every day, every 5 minutes
module.exports.SCHEDULE = '0 5 * * * *';
module.exports.NAME = 'GEN_EXEC_OR';
module.exports.JOB_BODY = async (config, log) => {

    //reference shortcuts
    const models = config.models;
    const RecipeOrder = models.RecipeOrder;
    const ExecutionOrder = models.ExecutionOrder;

    const pending_orders = RecipeOrder.findAll({
        where: {
            status: RECIPE_ORDER_STATUSES.Pending
        }
    });

    

};