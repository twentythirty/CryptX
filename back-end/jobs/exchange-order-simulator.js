"use strict";

const { logAction } = require('../utils/ActionLogUtil');

const action_path = 'execution_orders';

const actions = {
  placed: `${action_path}.placed`,
  error: `${action_path}.error`,
  failed_attempts: `${action_path}.failed_attempts`,
  failed: `${action_path}.failed`,
  generate_fill: `${action_path}.generate_fill`,
  fully_filled: `${action_path}.fully_filled`,
  modified: 'modified'
};

//every 5 seconds
module.exports.SCHEDULE = "*/5 * * * * *";
module.exports.NAME = "SIM_EXCH_OR";
module.exports.JOB_BODY = async (config, log) => {

  //reference shortcuts
  const models = config.models;
  const sequelize = models.sequelize;
  const ExecutionOrder = models.ExecutionOrder;

  /* pending_simulated_orders - execution orders of investments runs that are simulated */
  log(`1. Fetching all execution orders of simulated investment runs`);
  let [err, pending_simulated_orders] = await to(sequelize.query(`
    SELECT eo.*, imd.ask_price
    FROM execution_order eo 
    JOIN recipe_order ro ON ro.id=eo.recipe_order_id
    JOIN recipe_order_group rog ON rog.id=ro.recipe_order_group_id
    JOIN recipe_run rr ON rr.id=rog.recipe_run_id
    JOIN investment_run ir ON ir.id=rr.investment_run_id
    LEFT JOIN LATERAL (
      SELECT imd.ask_price
      FROM instrument_market_data imd
      WHERE imd.instrument_id=eo.instrument_id
        AND imd.exchange_id=eo.exchange_id
      ORDER BY imd.instrument_id NULLS LAST, imd.exchange_id NULLS LAST, imd.timestamp DESC NULLS LAST
      LIMIT 1
    ) AS imd ON TRUE
    WHERE ir.is_simulated=:is_simulated AND eo.status=:exec_order_status
    `, {
      replacements: { // replace keys with values in query
        is_simulated: true,
        exec_order_status: MODEL_CONST.EXECUTION_ORDER_STATUSES.Pending
      },
      model: ExecutionOrder, // parse results as InvestmenRun model
      type: sequelize.QueryTypes.SELECT
    }));

  if (err) {
    log(`[ERROR.1a]. Failed to fetch execution orders of simulated investment runs`);
    TE(err.message);
  }

  log(`1. Processing ${pending_simulated_orders.length} pending simulated investment run orders.`);

  return Promise.all(
    _.map(pending_simulated_orders, order => {
      let ask_price = order.dataValues.ask_price;
      let quantity = Decimal(order.spend_amount).div(Decimal(ask_price));

      order.placed_timestamp = new Date();
      order.total_quantity = quantity.toString();
      order.status = MODEL_CONST.EXECUTION_ORDER_STATUSES.InProgress;
      order.external_identifier = `SIM-${order.id}`;

      return order.save();
    })
  ).catch(err => {
    console.log(err);
  });
};