"use strict";

/* This job changes investment run status from OrdersExecuting to OrdersFilled
*  if all Recipe Orders belonging to investment run have status Completed.
*/

//every 5 minutes
module.exports.SCHEDULE = "*/5 * * * *";
module.exports.NAME = "INVEST_ST_CHANGE";
module.exports.JOB_BODY = async (config, log) => {

  //reference shortcuts
  const models = config.models;
  const sequelize = models.sequelize;
  const Op = sequelize.Op;
  const InvestmentRun = models.InvestmentRun;
  const RecipeRun = models.RecipeRun;
  const RecipeOrderGroup = models.RecipeOrderGroup;
  const RecipeOrder = models.RecipeOrder;

  /* find unfinishedd investment runs with status OrdersExecuting */
  let [err, investment_runs] = await to(InvestmentRun.findAll({
    where: {
      status: [INVESTMENT_RUN_STATUSES.OrdersExecuting]
    }
  }));

  if (err) {
    TE(err.message);
  }

  /* iterate through every unfinished investment run */
  return Promise.all(
      _.map(investment_runs, async (investment_run) => {
      
      // get RecipeRun with its related RecipeOrders
      let [err, approved_recipe] = await to(RecipeRun.findOne({
        where: {
          approval_status: RECIPE_RUN_STATUSES.Approved,
          investment_run_id: investment_run.id
        },
        include: [{
          model: RecipeOrderGroup,
          where: {
            approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved
          },
          include: {
            model: RecipeOrder
          }
        }]
      }));

      if (err) TE(err.message);

      // form flat array from models their relations
      let orders = _.flatMap(approved_recipe.RecipeOrderGroups.map((recipe_order_group) => {
        return recipe_order_group.RecipeOrders;
      }));

      /* if orders not empty and all of them have status COMPLETED */
      if (orders.length && orders.every(order => order.status == RECIPE_ORDER_STATUSES.Completed)) {
        investment_run.status = INVESTMENT_RUN_STATUSES.OrdersFilled;
        investment_run.updated_timestamp = new Date();
        investment_run.completed_timestamp = new Date();
        return investment_run.save();
      }

      return investment_run;
    })
  );
};