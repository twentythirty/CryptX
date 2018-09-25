"use strict";

const _ = require('lodash');
const {
  logAction
} = require('../utils/ActionLogUtil');

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

/**
 * This job exists as a stub for actual order placement during cucumber testing that still utilizes all
 * elements of regular flow. Main differences here are
 * 1. initial list of orders to "place" is provided as config.execution_orders
 * 2. list of orders to fail is provided as config.fail_ids
 * 3. no actual CCXT functions are used, so we dont need to throttle orders by exchange
 */
module.exports.SCHEDULE = -1;
module.exports.NAME = "CUCUMBER_PLACE_EXCH_OR";
module.exports.JOB_BODY = async (config, log) => {

  let pending_real_orders = config.execution_orders;

  log(`1. Processing ${pending_real_orders.length} pending real investment run orders.`);

  /* Get instrument exchange mapping and exchange info. Going to use external_instrument_id from it. */
  return Promise.resolve(pending_real_orders).then(execution_orders => {

      return Promise.all(_.map(execution_orders, (execution_order) => {

        if (config.fail_ids.includes(execution_order.id)) {

          return increment_failed_count(execution_order, `CUCUMBER: order ${execution_order.id} made to fail`, log);
        } else {

          execution_order.external_identifier = `CU-SIM-${execution_order.id}`;
          execution_order.placed_timestamp = new Date(new Date().getTime() - 1000);
          execution_order.status = EXECUTION_ORDER_STATUSES.InProgress;

          return execution_order.save().then(o => {
            return logAction(actions.placed, {
              args: {
                exchange: 'Cucumber'
              },
              relations: {
                execution_order_id: o.id
              }
            });
          });
        }
      })
    )
  });
};

let increment_failed_count = async function (execution_order, fail_message, log) {

  execution_order.failed_attempts++; // increment failed attempts counter

  if (execution_order.failed_attempts >= SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
    log(`Setting status of execution order ${execution_order.id} to Failed because it has reached failed send threshold (actual: ${execution_order.failed_attempts}, allowed: ${SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE})!`);
    await logAction(actions.failed_attempts, {
      args: {
        attempts: execution_order.failed_attempts
      },
      relations: {
        execution_order_id: execution_order.id
      }
    });
    execution_order.status = EXECUTION_ORDER_STATUSES.Failed;
  }
  
  return await execution_order.save();
};