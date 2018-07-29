'use strict'

const ccxtUtils = require('../utils/CCXTUtils');
const { eq, ne } = require('sequelize').Op;

module.exports.SCHEDULE = '0 */5 * * * *';
module.exports.NAME = 'FETCH_EXEC_OR_FILLS';
module.exports.JOB_BODY = async (config, log) => {
    return {}; //Blocks the execution for now 

    const models = config.models;
    const ExecutionOrder = models.ExecutionOrder;
    const ExecutionOrderFill = models.ExecutionOrderFill;
    const Instrument = models.Instrument;
    const { Placed, PartiallyFilled } = MODEL_CONST.EXECUTION_ORDER_STATUSES; 

    //Fetch all execution orders that are placed on the exchange, not failed, canceled or pending and has an external identifier.
    log('1. Fetching all Placed or PartiallyFilled execution orders.')
    return ExecutionOrder.findAll({
        where: {
            status: [ Placed, PartiallyFilled ],
            placed_timestamp: { [ne]: null },
            external_identifier: { [ne]: null }
        },
        include: {
            model: Instrument,
            as: 'instrument'
        }
    }).then(placed_orders => {
        return Promise.all(
            _.map(placed_orders, async placed_order => {

                let [ err, exchange_connector ] = await to(ccxtUtils.getConnector(placed_order.exchange_id));
                if(err) {
                    log(`[ERROR.1A] Error occured during exchange connection fetching: ${err.message}`);
                    placed_order.failed_attempts++;
                    return updateOrderStatus(placed_order, log, ExecutionOrderFill);
                }

                if(!exchange_connector) {
                    placed_order.failed_attempts++;
                    return updateOrderStatus(placed_order, log, ExecutionOrderFill);
                }

                const has_trades = exchange_connector.has['fetchTrades'];

                if(has_trades) {
                    log(`2. Fetching trades from exchange ${exchange.name} for order ${placed_order.id}`);
                    return handleFillsWithTrades(placed_order, exchange_connector, log, ExecutionOrderFill);
                }

                else {
                    log(`2. Fetching trades is not supported for exchange ${exchange.name}, retrieving order details instead for order ${placed_order.id}`);
                    return handleFillsWithoutTrades(placed_order, exchange_connector, log, ExecutionOrderFill);
                }

            })
        );
    });
};

/**
 * Will handle execution order fills by retrieving the trades from the exchange.
 * @param {Object} placed_order Order associated with the exchange.
 * @param {Object} exchange Exchange where the order was placed.
 * @param {Object} ExecutionOrderFill Fill model.
 */
const handleFillsWithTrades = async (placed_order, exchange, log, ExecutionOrderFill) => {

    log('3. Fetching current fills in the database')
    let [ err, order_fills ] = await to(ExecutionOrderFill.findAll({
        where: {
            execution_order_id: placed_order.id
        },
        order: [ [ 'fill_timestamp', 'DESC' ] ]
    }));

    if(err) {
        log(`[ERROR.3A] Error occured execution order fill fetching from the database: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, ExecutionOrderFill);
    }

    //To minimize the amount of retrieved trade entries, we will only take the ones since the last fill
    //or if there are no fills, then take the placement timestamp.
    const since = order_fills[0] ? order_fills[0].fill_timestamp : placed_order.placed_timestamp;

    log(`4. Fetching trades from the exchange from ${since}.`);
    let trades = [];
    [ err, trades ] = await to(exchange.fetchMyTrades(placed_order.instrument.symbol, since));

    if(err) {
        log(`[ERROR.4A] Error occured while attepting to fetch recent trades: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, ExecutionOrderFill);
    }

    if(!trades.length) {
        log(`[WARN.4A] No trades fetched, skipping...`);
        return placed_order;
    }

    //Check if exchange supports order identifiers for trades;
    const hadOrderIdentifier = trades[0].order ? true : false;

    //For now this orders will be handled as if they couldn't retrieve the trades at all,
    //Since there is not good way to link the trade to a specific execution order.
    if(!hadOrderIdentifier) {
        log(`[WARN.4B] Exchange ${exchange.name} trades don't have the order identifier, switching to tradeless fills method for order ${placed_order.id}`);
        return handleFillsWithoutTrades(placed_order, exchange, log, ExecutionOrderFill);
    }

    //Check if the trade contains its own identifier (For what ever reason, it might not)
    //Currently, all of the exchanges in use (at least the ones that support trade fetching, have unique ids)
    const hasItsOwnIdentifier = trades[0].id ? true : false;

    //Get trades that are only associated with the current palce order.
    const order_trades = _.filter(trades, trade => trade.order === placed_order.external_identifier);

    //Safety filter to filter out trades that are already in the database.
    const new_trades = _.filter(order_trades, trade => _.findIndex(order_fills, { external_identifier: trade.id }) === -1);

    if(!new_trades.length) {
        log(`[WARN.4C] No new trades found for order ${placed_order.id}, skipping...`);
        return placed_order;
    }

    const new_fills = new_trades.map(trade => {
        return {
            execution_order_id: placed_order.id,
            fill_timestamp: trade.timestamp,
            filled_quantity: trade.amount,
            external_identifier: trade.id
        }
    });

    log(`5. Attempting to save ${new_fills.length} new fills.`);
    let saved_fills = [];
    [ err, saved_fills ] = await to(ExecutionOrderFill.bulkCreate(new_fills));
    if(err) {
        log(`[ERROR.5A] Error occured during new fill saving: ${err.message}`);
        placed_order.failed_attempts++;
    }
    
    return updateOrderStatus(placed_order, log, ExecutionOrderFill);
}

/**
 * Will handle execution order fills by retrieving the order from the exchangeand comparing the fill number
 * with the sum of fills in the database.
 * @param {Object} placed_order Order associated with the exchange.
 * @param {Object} exchange Exchange where the order was placed.
 * @param {Object} ExecutionOrderFill Fill model.
 */
const handleFillsWithoutTrades = async (placed_order, exchange, log, ExecutionOrderFill) => {

    log(`3. Calculating the current sum of fills for order ${placed_order.id}`);
    let [ err, fill_amount_sum ] = await to(ExecutionOrderFill.sum('filled_quantity', {
        where: {
            execution_order_id: placed_order.id
        }
    }));

    if(err) {
        log(`[ERROR.3A] Error occured during fill amount summing: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, ExecutionOrderFill);
    }

    const can_fetch_by_id = exchange.has['fetchOrder'];
    const can_fetch_open_orders = exchange.has['fetchOpenOrders'];
    const can_fetch_all_orders = exchange.has['fetchOrders'];

    //In case somehow the exchange does not support order retrieval at all.
    if(!can_fetch_by_id && !can_fetch_open_orders && !can_fetch_all_orders) {
        log(`[ERROR.3B] Exchange ${exchange.name} has no method of retrieving the order: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, ExecutionOrderFill);
    }

    let external_order = null;
    log(`4. Fetching the order details from the exchange ${exchange.name} for order ${order.id}`);
    [ err, external_order ] = await to(fetchOrderFromExchange(placed_order, exchange));
    if(!external_order) {
        log(`[ERROR.4A] Error: could not fetch order from exchange with id ${placed_order.id} and external identifier ${placed_order.external_identifier}`)
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, ExecutionOrderFill);
    }

    log(`5. Checking for differences in the received order details and the current fill sum.`);
    if(external_order.filled > fill_amount_sum) {
        log(`[WARN.5A] Received fill amount of ${external_order.filled} is greater than the current fills sum of ${fill_amount_sum}, creating a new fill entry for order ${placed_order.id}.`);
        let new_fill;
        [ err, new_fill ] = await to(ExecutionOrderFill.create({
            execution_order_id: placed_order.id,
            fill_timestamp: Date.now(),
            filled_quantity: external_order.filled - fill_amount_sum
        }));

        if(err) {
            log(`[ERROR.5A] Error occured during the insertion of a new fill entry: ${err.message}`);
        }

        return placed_order;
    }
    //Since there are not changes, not need to call updateOrderStatus.
    else return placed_order;
}

/**
 * Updates the status of the order based on the situation.
 * @param {*} placed_order
 * @param {Object} ExecutionOrderFill Fill model.
 */
const updateOrderStatus = async (placed_order, log, ExecutionOrderFill) => {

    const { Failed, PartiallyFilled, FullyFilled } = MODEL_CONST.EXECUTION_ORDER_STATUSES; 

    log(`6. Checking for Execution order ${placed_order.id} status changes.`);

    //Check if the placed order should be considered failed.
    if(placed_order.failed_attempts > SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
        log(`[WARN.6A] Order ${placed_order.id} has exceeded the maximum number of failed attempts. Marking as "Failed"`);
        placed_order.status = Failed;
        return placed_order.save();
    }

    //Calculate the current sum of fills
    const [ err, fill_amount_sum ] = ExecutionOrderFill.sum('filled_quantity', {
        where: {
            execution_order_id: placed_order.id
        }
    });

    if(err) {
        log(`[ERROR.6A] Error occured during the calculation of the sum of current fills for order ${placed_order.id}`);
        return placed_order;
    }

    //If the sum is greater or equal to the required total quantity, mark the order as FullyFilled.
    if(fill_amount_sum >= placed_order.total_quantity) {
        log(`[WARN.6B] Order ${placed_order.id} was fully filled. Marking as "FullyFilled"`);
        placed_order.status = FullyFilled;
        return placed_order.save();
    }

    //If there is some filling and the order is not marked as PartiallyFilled, update the status then.
    else if(fill_amount_sum > 0 && placed_order.status !== PartiallyFilled) {
        log(`[WARN.6C] Order ${placed_order.id} has received it's first fill/fills. Marking it as "PartiallyFilled"`);
        placed_order.status = PartiallyFilled;
        return placed_order.save();
    }

    else return placed_order;
};

/**
 * Fetches order details from the exchange based on the database entry.
 * Depending on the exchange, may use different methods.
 * @param {Object} placed_order 
 * @param {Object} exchange 
 */
const fetchOrderFromExchange = (placed_order, exchange) => {
    return new Promise(async (resolve, reject) => {
        let external_order = null;
        const symbol = placed_order.instrument.symbol;
        const since = placed_order.placed_timestamp;

        //Best case scenario, will attempt to retrieve the order by id.
        if(can_fetch_by_id && !external_order) {
            [ err, external_order ] = await to(exchange.fetchOrder(placed_order.external_identifier, symbol));
            if(err) return reject(err);
        }

        let external_orders = placed_order;

        //Second best scenario will retrieve using open only orders (still less orders to check then with all orders)
        if(can_fetch_open_orders && !external_order) {
            [ err, external_orders ] = await to(exchnage.fetchOpenOrders(symbol, since));
            if(err) return reject(err);
        }

        //Worst case scenario will take all orders and filter out the correct one.
        if(can_fetch_open_orders && !external_orders.length && !external_order) {
            [ err, external_orders ] = await to(exchnage.fetchOrders(symbol, since));
            if(err) return reject(err);
        }

        //If multiple orders were received instead of one by id, search the array for the corresponding order.
        if(external_orders.length) {
            external_order = _.find(external_orders, { id: placed_order.external_identifier });
        }

        resolve(external_order);
    });
};

//Export the additional functions to spy on in the unit tests.
module.exports.handleFillsWithTrades = handleFillsWithTrades;
module.exports.handleFillsWithoutTrades = handleFillsWithoutTrades;
module.exports.updateOrderStatus = updateOrderStatus;