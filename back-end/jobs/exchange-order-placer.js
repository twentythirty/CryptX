"use strict";

const ccxt = require('ccxt');
const ccxtUnified = require('../utils/ccxtUnified');

//every 5 seconds
module.exports.SCHEDULE = "*/5 * * * * *";
module.exports.NAME = "PLACE_EXCH_OR";
module.exports.JOB_BODY = async (config, log) => {

    const send_orders = true; // changing this will enable or disable sending orders to exchanges. This is a safety measure to prevent accidental ordering.
    
    //reference shortcuts
    const models = config.models;
    const sequelize = config.models.sequelize;
    const ExecutionOrder = models.ExecutionOrder;
    const InvestmentRun = models.InvestmentRun;
    const Instrument = models.Instrument;
    const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
    const Exchange = models.Exchange;

    /* all_pending_orders - list of all pending execution orders in database.
      Trying to push all orders to exchanges might result in API call rate limitting,
      so instead execution orders from exchanges will be grouped and execution in
      iterations and we'll use one exchange only once every iteration.
    */
    log(`Fetch orders with PENDING status`);
    let all_pending_orders = await ExecutionOrder.findAll({
      where: {
        status: MODEL_CONST.EXECUTION_ORDER_STATUSES.Pending
      },
      include: Instrument
    });



    /* pending_orders - orders from different exchanges that are going to be sent to exchanges.
    Number of orders shouldn't exceed number of exchanges. */
    log(`Group orders by exchange and return only first order of exchange`);
    let pending_orders = _.map(
      _.groupBy(all_pending_orders, 'exchange_id'),
      (exchange_orders) => { return exchange_orders[0]; } // return only first order for exchange
    );
    
    /* Get instrument exchange mapping and exchange info. Going to use external_instrument_id from it. */ 
    log(`Fetching data for placing order`);
    return Promise.all(
      _.map(pending_orders, (pending_order) => {

        let prm = [
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
        ];

        return Promise.all(prm);
      })
    ).then(orders_with_data => {

      return Promise.all(
        _.map(orders_with_data, async (order_with_data) => {
          
          let [order, investment_run, instrument_exchange_map, exchange_info] = order_with_data;
          if (!order || !investment_run || !instrument_exchange_map || !exchange_info) {
            log(`Execution order data not found`);
            return orders_with_data;
          }
          log(`Processing execution order ID: ${order.id} from investment run ID: ${investment_run.id}`);
          
          let exchange = new (ccxtUnified.getExchange(exchange_info.api_id))();
          let init_done = await exchange.isReady(); // wait for initialization to complete
          
          /* As we have two different ways to acquire an asset (buying and selling),
          and some exchages do not support creating market orders(and user limit orders instead)
          this bit of code decides how order is going to be executed. */
          let order_type;
          let exchange_supports_order_type = false; // assume exchange doesn't support action, confirm or deny in switch statement
  
          
          switch (order.type) {
            case EXECUTION_ORDER_TYPES.Market:
              order_type = 'market';
              exchange_supports_order_type = exchange._connector.has.createMarketOrder;
              break;
            case EXECUTION_ORDER_TYPES.Limit:
              order_type = 'limit';
              exchange_supports_order_type = exchange._connector.has.createLimitOrder;
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
            log(`Order type ${ order.type } is not supported by ${ order.exchange_id } exchange`);
            return order_with_data;
          }

          if (order.type == EXECUTION_ORDER_TYPES.Limit && !order.price) {
            log("Limit orders require price and this execution order doesn't have it.");
            return order_with_data;
          }

          if (investment_run.is_simulated || !send_orders)
            return log(`Prevented from sending order: createOrder(${instrument_exchange_map.external_instrument_id}, ${order_type}, ${order_execution_side}, ${order.total_quantity}[, ${order.price}[, params]])`);
          else {
            log(`Executing: createOrder(${instrument_exchange_map.external_instrument_id}, ${order_type}, ${order_execution_side}, ${order.total_quantity}[, ${order.price}[, params]])`);
            
            return exchange.createMarketOrder(instrument_exchange_map.external_instrument_id, order_execution_side, order).then(order_response => {
              order.external_identifier = order_response.id;
              order.placed_timestamp = order_response.timestamp;
              order.status = EXECUTION_ORDER_STATUSES.Placed
              
              order.save();

              return order_with_data;
            }).catch((err) => { // order placing failed. Perform actions below.
              order.failed_attempts++; // increment failed attempts counter
              if (order.failed_attempts >= SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
                log(`Setting status of execution order ${order.id} to Failed because it has reached failed send threshold (actual: ${order.failed_attempts}, allowed: ${SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE})!`);
                order.status = EXECUTION_ORDER_STATUSES.Failed;
              }
              order.save();

              return order_with_data;
            });
          }
        }));
    }).catch(err => {
      log(err);
    });
};