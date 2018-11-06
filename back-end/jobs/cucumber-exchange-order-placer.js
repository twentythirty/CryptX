"use strict";

const _ = require('lodash');
const {
  logAction
} = require('../utils/ActionLogUtil');
const ccxtUtils = require('../utils/CCXTUtils');

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
  const InstrumentExchangeMapping = config.models.InstrumentExchangeMapping;
  const Exchange = config.models.Exchange;


  log(`1. Processing ${pending_real_orders.length} pending real investment run orders.`);

  /* Get instrument exchange mapping and exchange info. Going to use external_instrument_id from it. */
  return Promise.resolve(pending_real_orders).then(execution_orders => {

    return Promise.all(
      _.map(execution_orders, async (pending_order) => {
        let err, mapp, result;

        log(`2. Fetching instrument mapping by exchange_id=${pending_order.exchange_id} and instrument_id=${pending_order.instrument_id}`)
        mapp = InstrumentExchangeMapping.findOne({
          where: {
            exchange_id: pending_order.exchange_id,
            instrument_id: pending_order.instrument_id
          },
          include: [Exchange]
        });

        [err, result] = await to(Promise.all(
          [pending_order, mapp]
        ));

        if (err) {
          log(err_message = `[ERROR.2a] Failed to fetch instrument mapping.`)
          return [pending_order, mapp];
        }

        return result;
      })
    ).then(orders_with_data => {

      return Promise.all(

        _.map(orders_with_data, async (order_with_data) => {
  
          let [order, instrument_exchange_map] = order_with_data;
          let err_message;
          
          if (!instrument_exchange_map) {
            log(err_message = `[ERROR.2b] No instrument exchange mapping data for execution order ID=${order.id} found.
            Expected to be found in instrument_exchange_mapping table by instrument_ID=${order.instrument_id} and exchange_id=${order.exchange_id}`);
            await increment_failed_count(order, err_message, log);
            return order_with_data;
          }
  
  
          log(`3. Getting unified exchange object of ${instrument_exchange_map.Exchange.api_id}`);
          let connector = await ccxtUtils.getConnector(order.exchange_id);
          if (!connector) {
            log(err_message = `[Error.3a] No unified exchange object found. Order can't be placed without.`);
            await increment_failed_count(order, err_message, log);
            return order_with_data;
          }
  
          log(`4. Processing execution order ID: ${order.id}`);
          /* As we have two different ways to acquire an asset (buying and selling),
          and some exchanges do not support creating market orders(and user limit orders instead)
          this bit of code decides how order is going to be executed. */        
          let order_type = _.invert(EXECUTION_ORDER_TYPES)[order.type].toLocaleLowerCase();
          let order_execution_side = _.invert(ORDER_SIDES)[order.side].toLocaleLowerCase();
  
          if (order_type != "market") {
            log(err_message = "[ERROR.4a] Only market orders are supported at the moment!");
            await increment_failed_count(order, err_message, log);
            return order_with_data;
          }
  
          if (!connector.has.createMarketOrder) { // while market orders are used this check will only make sure that exchange supports market order
            log(err_message =`[ERROR.4b] '${order_type}' order type is not supported by '${connector.id}' exchange`);
            increment_failed_count(order, err_message, log);
            return order_with_data;
          }
  
          log(`5. Placing order to ${connector.id}. Instrument symbol: ${instrument_exchange_map.external_instrument_id}, type: ${order_type}, side: ${order_execution_side}, amount: ${order.total_quantity}`);
          /*  later on when we'll introduce other order types this can be changed to just function for placing orders */
          return connector.createMarketOrder(instrument_exchange_map.external_instrument_id, order_execution_side, order)
          .then(async (order_response) => {
            log(`5a. Successfully received order placement response from exchange`);
            order.external_identifier = order_response.id;
            /* as actual timestamps in exchanges might be lower than ones we get with response, we make our timestamp smaller. 
             max difference between times is of is -1 second. */
            let timestamp = order_response.timestamp - 1000; // subtract 1000 miliseconds from timestamp
            order.placed_timestamp = timestamp;
            order.status = EXECUTION_ORDER_STATUSES.InProgress;
  
            await order.save();
  
            await logAction(actions.placed, {
              args: { exchange: exchange.name },
              relations: { execution_order_id: order.id }
            });
            
            return order_with_data;
          }).catch(async (err) => { // order placing failed. Perform actions below.
            log(err_message = `[WARN.5b]. Order placement to exchange failed. Error message: ${err}`);
            await logAction(actions.error, {
              args: { error: err },
              relations: { execution_order_id: order.id }
            });
  
            await increment_failed_count(order, err_message, log);
  
            return order_with_data;
          });
        }));
    });
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