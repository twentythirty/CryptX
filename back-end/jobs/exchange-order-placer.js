"use strict";

const _ = require('lodash');
const ccxt = require('ccxt');
const ccxtUnified = require('../utils/ccxtUnified');
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
module.exports.NAME = "PLACE_EXCH_OR";
module.exports.JOB_BODY = async (config, log) => {

  //reference shortcuts
  const models = config.models;
  const sequelize = models.sequelize;
  const RecipeOrder = models.RecipeOrder;
  const RecipeOrderGroup = models.RecipeOrderGroup;
  const ExecutionOrder = models.ExecutionOrder;
  const InvestmentRun = models.InvestmentRun;
  const Instrument = models.Instrument;
  const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
  const Exchange = models.Exchange;

  let err_message;
  /* pending_real_orders - list of pending exeution orders that are belong to
    real(not simulated) investment run. Trying to push all orders to exchanges
    might result in API call rate limitting, so instead execution orders from
    exchanges will be grouped and execution in iterations and we'll use one
    exchange once every iteration.
  */
 log(`1. Fetching all execution orders of real investment runs`);
 let [err, pending_real_orders] = await to(sequelize.query(`
    SELECT eo.* 
    FROM execution_order eo 
    JOIN recipe_order ro ON ro.id=eo.recipe_order_id
    JOIN recipe_order_group rog ON rog.id=ro.recipe_order_group_id
    JOIN recipe_run rr ON rr.id=rog.recipe_run_id
    JOIN investment_run ir ON ir.id=rr.investment_run_id
    WHERE ir.is_simulated=:is_simulated AND eo.status=:exec_order_status
    `, {
    replacements: { // replace keys with values in query
      is_simulated: false,
      exec_order_status: MODEL_CONST.EXECUTION_ORDER_STATUSES.Pending
    },
    model: ExecutionOrder, // parse results as InvestmenRun model
    type: sequelize.QueryTypes.SELECT
  }));
  if (err) {
    log(`[ERROR.1a]. Failed to fetch execution orders of real investment runs`);
    TE(err.message);
  }

  log(`1. Processing ${pending_real_orders.length} pending real investment run orders.`);
  /* pending_orders - orders from different exchanges that are going to be sent to exchanges.
  Number of orders shouldn't exceed number of exchanges. */
  let pending_orders = _.map(
    _.groupBy(pending_real_orders, 'exchange_id'),
    (exchange_orders) => { return exchange_orders[0]; } // return only first order for exchange
  );

  /* Get instrument exchange mapping and exchange info. Going to use external_instrument_id from it. */
  return Promise.all(
    _.map(pending_orders, async (pending_order) => {
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
        
        if (!instrument_exchange_map) {
          log(err_message = `[ERROR.2b] No instrument exchange mapping data for execution order ID=${order.id} found.
          Expected to be found in instrument_exchange_mapping table by instrument_ID=${order.instrument_id} and exchange_id=${order.exchange_id}`);
          increment_failed_count(order, err_message, log);
          return order_with_data;
        }


        log(`3. Getting unified exchange object of ${instrument_exchange_map.Exchange.api_id}`);
        let unifiedExchange = await ccxtUnified.getExchange(instrument_exchange_map.Exchange.api_id);
        if (!unifiedExchange) {
          log(err_message = `[Error.3a] No unified exchange object found. Order can't be placed without.`);
          increment_failed_count(order, err_message, log);
          return order_with_data;
        }
        log(`3.1. Waiting for exchange connector of ${instrument_exchange_map.Exchange.api_id} to initialize`);
        await unifiedExchange.isReady(); // wait for initialization to complete

        log(`4. Processing execution order ID: ${order.id}`);
        /* As we have two different ways to acquire an asset (buying and selling),
        and some exchanges do not support creating market orders(and user limit orders instead)
        this bit of code decides how order is going to be executed. */        
        let order_type = _.invert(EXECUTION_ORDER_TYPES)[order.type].toLocaleLowerCase();
        let order_execution_side = _.invert(ORDER_SIDES)[order.side].toLocaleLowerCase();

        if (order_type != "market") {
          log(err_message = "[ERROR.4a] Only market orders are supported at the moment!");
          increment_failed_count(order, err_message, log);
          return order_with_data;
        }

        if (!unifiedExchange._connector.has.createMarketOrder) { // while market orders are used this check will only make sure that exchange supports market order
          log(err_message =`[ERROR.4b] '${order_type}' order type is not supported by '${unifiedExchange.api_id}' exchange`);
          increment_failed_count(order, err_message, log);
          return order_with_data;
        }

        log(`5. Placing order to ${unifiedExchange.api_id}. Instrument symbol: ${instrument_exchange_map.external_instrument_id}, type: ${order_type}, side: ${order_execution_side}, amount: ${order.total_quantity}`);
        /*  later on when we'll introduce other order types this can be changed to just function for placing orders */
        return unifiedExchange.createMarketOrder(instrument_exchange_map.external_instrument_id, order_execution_side, order)
        .then(async result => {
          let [data, order_response] = result
          log(`5a. Successfully received order placement response from exchange`);
          order = Object.assign(order, data, {
            status: EXECUTION_ORDER_STATUSES.InProgress,
          })

          await order.save();

          await logAction(actions.placed, {
            args: { 
              exchange: unifiedExchange.api_id,
              spend_amount: order.spend_amount,
              quantity: order.quantity
            },
            relations: { execution_order_id: order.id }
          });
          
          return order_with_data;
        }).catch(async (err) => { // order placing failed. Perform actions below.
          log(err_message = `[WARN.5b]. Order placement to exchange failed. Error message: ${err.message}`);
          await logAction(actions.error, {
            args: { error: err.message },
            relations: { execution_order_id: order.id }
          });

          order = await increment_failed_count(order, err_message, log);

          return order_with_data;
        });
      }));
  });
};

let increment_failed_count = function (execution_order, fail_message, log) {

  execution_order.failed_attempts++; // increment failed attempts counter

  if (execution_order.failed_attempts >= SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
    log(`Setting status of execution order ${execution_order.id} to Failed because it has reached failed send threshold (actual: ${execution_order.failed_attempts}, allowed: ${SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE})!`);
    logAction(actions.failed_attempts, {
      args: { attempts: execution_order.failed_attempts },
      relations: { execution_order_id: execution_order.id }
    });
    execution_order.status = EXECUTION_ORDER_STATUSES.Failed;
  }
  
  return execution_order.save();
};