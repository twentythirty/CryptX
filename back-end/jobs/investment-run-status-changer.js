"use strict";

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

  let [err, investment_runs] = await to(InvestmentRun.findAll({
    where: {
      status: [INVESTMENT_RUN_STATUSES.OrdersApproved, INVESTMENT_RUN_STATUSES.OrdersExecuting]
    }
  }));

  if (err) {
    TE(err.message);
  }

  return _.map(investment_runs, async(investment_run) => {
    
    // get RecipeRun with its relations until RecipeOrder
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

    // form flat array from models their relations
    let orders = _.flatMap(approved_recipe.RecipeOrderGroups.map((recipe_order_group) => {
      return recipe_order_group.RecipeOrders;
    }));

    if (orders.every(order => order.status == RECIPE_ORDER_STATUSES.Completed)) {
      investment_run.status = INVESTMENT_RUN_STATUSES.OrdersFilled;
      return investment_run.save();
    }
  });
};