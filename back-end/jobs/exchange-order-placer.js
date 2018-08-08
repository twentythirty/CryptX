"use strict";

const ccxt = require('ccxt');
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

  const send_orders = true; // changing this will enable or disable sending orders to exchanges. This is a safety measure to prevent accidental ordering.

  //reference shortcuts
  const models = config.models;
  const sequelize = config.sequelize;
  const RecipeOrder = models.RecipeOrder;
  const RecipeOrderGroup = models.RecipeOrderGroup;
  const ExecutionOrder = models.ExecutionOrder;
  const InvestmentRun = models.InvestmentRun;
  const Instrument = models.Instrument;
  const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
  const Exchange = models.Exchange;

  /* all_pending_orders - list of all pending execution orders in database.
    Trying to push all orders to exchanges might result in API call rate limitting,
    so instead execution orders from exchanges will be grouped and execution in
    iterations and we'll use one exchange once every iteration.
  */
  let all_pending_orders = await ExecutionOrder.findAll({
    where: {
      status: MODEL_CONST.EXECUTION_ORDER_STATUSES.Pending
    },
    include: Instrument
  });



  /* pending_orders - orders from different exchanges that are going to be sent to exchanges.
  Number of orders shouldn't exceed number of exchanges. */
  let pending_orders = _.map(
    _.groupBy(all_pending_orders, 'exchange_id'),
    (exchange_orders) => { return exchange_orders[0]; } // return only first order for exchange
  );

  /* Get instrument exchange mapping and exchange info. Going to use external_instrument_id from it. */
  return Promise.all(
    _.map(pending_orders, (pending_order) => {

      return Promise.all([
        Promise.resolve(pending_order),
        sequelize.query(`
              SELECT ir.* 
              FROM execution_order ed 
              JOIN recipe_order ro ON ro.id=ed.recipe_order_id
              JOIN recipe_order_group rog ON rog.id=ro.recipe_order_group_id
              JOIN recipe_run rr ON rr.id=rog.recipe_run_id
              JOIN investment_run ir ON ir.id=rr.investment_run_id
              WHERE ed.id=:execution_order_id
            `, {
            plain: true, // makes raw query be parsed as single result, not array
            replacements: { // replace keys with values in query
              execution_order_id: pending_order.id
            },
            model: InvestmentRun, // parse results as InvestmenRun model
            type: sequelize.QueryTypes.SELECT
          }),
        InstrumentExchangeMapping.findOne({
          where: {
            exchange_id: pending_order.exchange_id,
            instrument_id: pending_order.instrument_id
          },
        }),
        Exchange.findOne({
          where: {
            id: pending_order.exchange_id
          }
        })
      ]);
    })
  ).then(orders_with_data => {

    return Promise.all(
      _.map(orders_with_data, (order_with_data) => {

        let [order, investment_run, instrument_exchange_map, exchange_info] = order_with_data;
        log(investment_run);
        let exchange = new ccxt[exchange_info.api_id]();

        /* As we have two different ways to acquire an asset (buying and selling),
        and some exchages do not support creating market orders(and user limit orders instead)
        this bit of code decides how order is going to be executed. */
        let order_type;
        let exchange_supports_order_type = false; // assume exchange doesn't support action, confirm or deny in switch statement


        switch (order.type) {
          case EXECUTION_ORDER_TYPES.Market:
            order_type = 'market';
            exchange_supports_order_type = exchange.has.createMarketOrder;
            break;
          case EXECUTION_ORDER_TYPES.Limit:
            order_type = 'limit';
            exchange_supports_order_type = exchange.has.createLimitOrder;
            break;
          case EXECUTION_ORDER_TYPES.Stop:
            order_type = 'stop';
            log("--- CCXT doesn't have stop orders. They are ignored for now...");
            exchange_supports_order_type = false;
            break;
          default:
            return TE("Unknown order type. Should be market, limit or stop order.");
        }

        if (order_type != "market") {
          log("Only market orders can be created at the moment");
          return Promise.resolve(order);
        }

        let order_execution_side;
        switch (order.side) {
          case ORDER_SIDES.Buy:
            order_execution_side = "buy";
            break;
          case ORDER_SIDES.Sell:
            order_execution_side = "sell";
            break;
          default:
            return TE("Uknown order action. Should be either buy or sell.");
        }

        if (!exchange_supports_order_type) {
          log(`Order type ${order.type} is not supported by ${order.exchange_id} exchange`);
          return order_with_data;
        }

        if (order.type == EXECUTION_ORDER_TYPES.Limit && !order.price) {
          log("Limit orders require price and this execution order doesn't have it.");
          return order_with_data;
        }

        if (investment_run.is_simulated || !send_orders)
          return Promise.resolve(log(`Prevented from sending order: createOrder(${instrument_exchange_map.external_instrument_id}, ${order_type}, ${order_execution_side}, ${order.total_quantity}[, ${order.price}[, params]])`));
        else {
          log(`Executing: createOrder(${instrument_exchange_map.external_instrument_id}, ${order_type}, ${order_execution_side}, ${order.total_quantity}[, ${order.price}[, params]])`);

          return exchange.createOrder(instrument_exchange_map.external_instrument_id, order_type, order_execution_side, order.total_quantity, order.price, {
            test: true
          }).then(order_response => {
            order.external_identifier = order_response.id;
            order.placed_timestamp = order_response.timestamp;
            /* order statuses (need to assure what kind of data is returned during real order placement)
              open - order should be executing in exchange
              closed - could mean order is already executed, might do nothing here as other job should check if its done
              canceled - order probably wasn't placed for some reason.
              */
            if (order_response == "open") {
              order.status = EXECUTION_ORDER_STATUSES.Placed
            }

            order.save().then(o => {
              logAction(actions.placed, {
                exchange: exchange.name,
                relations: { execution_order_id: order.id }
              });
            });

            return Promise.resolve(order_with_data);
          }).catch((err) => { // order placing failed. Perform actions below.

            logAction(actions.error, {
              error: err.message,
              relations: { execution_order_id: order.id }
            });

            order.failed_attempts++; // increment failed attempts counter
            if (order.failed_attempts >= SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
              log(`Setting status of execution order ${order.id} to Failed because it has reached failed send threshold (actual: ${order.failed_attempts}, allowed: ${SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE})!`);
              logAction(actions.failed_attempts, {
                attempts: order.failed_attempts,
                relations: { execution_order_id: order.id }
              });
              order.status = EXECUTION_ORDER_STATUSES.Failed;
            }
            order.save();

            return Promise.resolve(order_with_data);
          });
        }
      }));
  });
};