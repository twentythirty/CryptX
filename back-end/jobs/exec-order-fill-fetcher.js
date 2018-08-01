'use strict'

const ccxtUtils = require('../utils/CCXTUtils');
const { eq, ne } = require('sequelize').Op;

module.exports.SCHEDULE = '0 */5 * * * *';
module.exports.NAME = 'FETCH_EXEC_OR_FILLS';
module.exports.JOB_BODY = async (config, log) => {

    const models = config.models;
    const ExecutionOrder = models.ExecutionOrder;
    const ExecutionOrderFill = models.ExecutionOrderFill;
    const Instrument = models.Instrument;
    const { Placed, PartiallyFilled, Failed, FullyFilled } = MODEL_CONST.EXECUTION_ORDER_STATUSES; 

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

                //Fetch exchange connect based on exchange_id of the order
                let [ err, exchange ] = await to(ccxtUtils.getConnector(placed_order.exchange_id));
                if(err) {
                    log(`[ERROR.1A] Error occured during exchange connection fetching: ${err.message}`);
                    placed_order.failed_attempts++;
                    return updateOrderStatus(placed_order, log, config);
                }

                if(!exchange) {
                    log(`[ERROR.1B] Error: could not find an exchange connector for order ${placed_order.id}`);
                    placed_order.failed_attempts++;
                    return updateOrderStatus(placed_order, log, config);
                }
                
                //Fetch the order object from the exchange.
                let external_order = null;
                
                log(`2. Fetching the order details from the exchange ${exchange.name} for order ${placed_order.id}`);
                [ err, external_order ] = await to(fetchOrderFromExchange(placed_order, exchange, log));
                
                if(err){
                    log(`[ERROR.2A] Error occured during order fetching from the exchange: ${err.message}`);
                    placed_order.failed_attempts++; 
                    return updateOrderStatus(placed_order, log, config);
                }

                if(!external_order) {
                    log(`[ERROR.2B] Error: could not fetch order from exchange with id ${placed_order.id} and external identifier ${placed_order.external_identifier}`);
                    placed_order.failed_attempts++; //Not marked as Failed, in case it's only a connection issue.
                    return updateOrderStatus(placed_order, log, config);
                }

                /** 
                 * When succesfully placed orders somehow fail during trading on the exchanges, CCXT library always marks them as 'closed'.
                 * Instead of using a specific status name (ex: 'expired'). One way to identify this situations, is to check if the order was 'closed'
                 * and then check if the order was not fully filled. In cases where the order was manually canceled, CCXT also marks it as 'closed', however,
                 * it should be marked as canceled in the database, thus not appear in this job cycle naymore.
                 */
                if(external_order.status === 'closed' && external_order.remaining > 0) {
                    log(`[WARN.2A] Execution order ${placed_order.id} was closed on the exchange before getting filled, marking as Failed`);
                    placed_order.status = Failed;
                    return updateOrderStatus(placed_order, log, config);
                }

                /**
                 * Currently it's a bit hard to tell if all of the data will be synced completely accurately with the database.
                 * Therefor, to make sure that the Execution order was filled fully, it will be check using the Order object
                 * received from the exchange.
                 * in CCXT, fully filled orders are 'closed'
                 */
                if(external_order.status === 'closed' && external_order.remaining === 0){
                    log(`[WARN.2B] Execution order ${placed_order.id} was closed and the remaining amount is equal to 0, marking as FullyFilled`);
                    placed_order.status = FullyFilled;
                    //The execution will continue, as the job might be missing the last fill/fills.
                }

                //Flag that determines how to create new fills (using trades or calculating using the filled field of the order)
                const has_trades = exchange.has['fetchTrades'];

                if(has_trades) {
                    log(`[WARN.2C] Fetching trades is supported from exchange ${exchange.name} for order ${placed_order.id}`);
                    return module.exports.handleFillsWithTrades(placed_order, exchange, external_order, log, config);
                }

                else {
                    log(`[WARN.2D] Fetching trades is not supported for exchange ${exchange.name}, calculating fills by order details instead ${placed_order.id}`);
                    return module.exports.handleFillsWithoutTrades(placed_order, external_order, log, config);
                }

            })
        );
    });
};

/**
 * Will handle execution order fills by retrieving the trades from the exchange.
 * NOTE: this is set to exports immediately in order to use in tests with sinon. Might need a cleaner solution. 
 * @param {Object} placed_order Order associated with the exchange.
 * @param {Object} exchange Exchange where the order was placed.
 * @param {Object} config job config.
 */
module.exports.handleFillsWithTrades = async (placed_order, exchange, external_order, log, config) => {

    const ExecutionOrderFill = config.models.ExecutionOrderFill;

    log('3. Fetching current fills in the database')
    let [ err, order_fills ] = await to(ExecutionOrderFill.findAll({
        where: {
            execution_order_id: placed_order.id
        },
        order: [ [ 'timestamp', 'DESC' ] ]
    }));

    if(err) {
        log(`[ERROR.3A] Error occured execution order fill fetching from the database: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, config);
    }

    //To minimize the amount of retrieved trade entries, we will only take the ones since the last fill
    //or if there are no fills, then take the placement timestamp.
    const since = order_fills[0] ? order_fills[0].timestamp : placed_order.placed_timestamp;

    log(`4. Fetching trades from the exchange from ${since}.`);
    let trades = [];
    [ err, trades ] = await to(exchange.fetchMyTrades(placed_order.instrument.symbol, since));

    if(err) {
        log(`[ERROR.4A] Error occured while attepting to fetch recent trades: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, config);
    }

    if(!trades.length) {
        log(`[WARN.4A] No trades fetched, skipping...`);
        return updateOrderStatus(placed_order, log, config);
    }

    //Check if exchange supports order identifiers for trades;
    const hadOrderIdentifier = trades[0].order ? true : false;

    //For now this orders will be handled as if they couldn't retrieve the trades at all,
    //Since there is not good way to link the trade to a specific execution order.
    if(!hadOrderIdentifier) {
        log(`[WARN.4B] Exchange ${exchange.name} trades don't have the order identifier, switching to tradeless fills method for order ${placed_order.id}`);
        return module.exports.handleFillsWithoutTrades(placed_order, external_order, log, config);
    }

    log(`5. Filtering ${trades.length} trade for new trades.`);

    //Check if the trade contains its own identifier (For what ever reason, it might not)
    //Currently, all of the exchanges in use (at least the ones that support trade fetching, have unique ids)
    const hasItsOwnIdentifier = trades[0].id ? true : false;

    //Get trades that are only associated with the current palce order.
    const order_trades = _.filter(trades, trade => trade.order === placed_order.external_identifier);

    //Safety filter to filter out trades that are already in the database.
    const new_trades = _.filter(order_trades, trade => _.findIndex(order_fills, { external_identifier: String(trade.id) }) === -1);

    if(!new_trades.length) {
        log(`[WARN.5A] No new trades found for order ${placed_order.id}, skipping...`);
        return updateOrderStatus(placed_order, log, config);
    }

    log(`[WARN.5B] Found ${new_trades.length} trades, saving to database`);
    const new_fills = new_trades.map(trade => {
        const fee = trade.fee ? trade.fee.cost : 0;
        placed_order.fee += fee;
        return {
            execution_order_id: placed_order.id,
            timestamp: trade.timestamp,
            quantity: trade.amount,
            external_identifier: String(trade.id),
            fee: fee,
            price: trade.price
        }
    });

    let saved_fills = [];
    [ err, saved_fills ] = await to(ExecutionOrderFill.bulkCreate(new_fills));
    if(err) {
        log(`[ERROR.5C] Error occured during new fill saving: ${err.message}`);
        placed_order.failed_attempts++;
    }
    
    return updateOrderStatus(placed_order, log, config);
}

/**
 * Will handle execution order fills by retrieving the order from the exchangeand comparing the fill number
 * with the sum of fills in the database.
 * @param {Object} placed_order Order associated with the exchange.
 * @param {Object} external_order Order object from the exchange.
 * @param {Object} config job config.
 */
module.exports.handleFillsWithoutTrades = async (placed_order, external_order, log, config) => {

    const ExecutionOrderFill = config.models.ExecutionOrderFill;
    //Add a flag to the Execution order, marking that its fills were emulated. Will be used for fees.
    placed_order.emulated_fills = true;

    //Check if the external_order has the order fee
    if(external_order.fee) {
        placed_order.fee = external_order.fee.cost;
    }

    log(`3. Calculating the current sum of fills for order ${placed_order.id}`);
    let [ err, fill_amount_sum ] = await to(ExecutionOrderFill.sum('quantity', {
        where: {
            execution_order_id: placed_order.id
        }
    }));

    if(err) {
        log(`[ERROR.3A] Error occured during fill amount summing: ${err.message}`);
        placed_order.failed_attempts++;
        return updateOrderStatus(placed_order, log, config);
    }

    log(`4. Checking for differences in the received order details and the current fill sum.`);
    if(external_order.filled > fill_amount_sum) {
        log(`[WARN.4A] Received fill amount of ${external_order.filled} is greater than the current fills sum of ${fill_amount_sum}, creating a new fill entry for order ${placed_order.id}.`);
        let new_fill;
        [ err, new_fill ] = await to(ExecutionOrderFill.create({
            execution_order_id: placed_order.id,
            timestamp: new Date(),
            quantity: external_order.filled - fill_amount_sum
        }));

        if(err) {
            log(`[ERROR.4A] Error occured during the insertion of a new fill entry: ${err.message}`);
            placed_order.failed_attempts++;
            return updateOrderStatus(placed_order, log, config);
        }

        return updateOrderStatus(placed_order, log, config);
    }

    else {
        log(`[WARN.4B] Filled amount does not exceed current sum of fills, skipping..`)
        return updateOrderStatus(placed_order, log, config);
    }
}

/**
 * Updates the status of the order based on the situation.
 * @param {*} placed_order
 * @param {*} log logger
 * @param {Object} config job config.
 */
const updateOrderStatus = async (placed_order, log, config) => {

    const sequelize = config.sequelize;
    const ExecutionOrderFill = config.models.ExecutionOrderFill;

    const { Failed, Placed, PartiallyFilled, FullyFilled } = MODEL_CONST.EXECUTION_ORDER_STATUSES; 

    log(`6. Checking for Execution order ${placed_order.id} failed attempts exceed the tolerance number.`);

    //Check if the placed order should be considered failed.
    if(placed_order.failed_attempts > SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
        log(`[WARN.6A] Order ${placed_order.id} has exceeded the maximum number of failed attempts. Marking as "Failed"`);
        placed_order.status = Failed;
        return placed_order.save();
    }

    log(`7. Analyzing the currrent Execution order ${placed_order.id} after checking for new fills.`);
    //Calculate the current sum of fills
    let [ err, fill_amount_sum ] = await to(ExecutionOrderFill.sum('quantity', {
        where: {
            execution_order_id: placed_order.id
        }
    }));

    if(err) {
        log(`[ERROR.7A] Error occured during the calculation of the sum of current fills for order ${placed_order.id}`);
        placed_order.failed_attempts++;
    }

    /**
     * In case when the trades were unavailable (or the trades did not point to any orders)
     * The job will spread the Execution order price based on the current amount sum of fills and their individual amount
     * The job will also spread the current order fee(if it exists) across the fills based on their filld amount.
     */
    if(placed_order.emulated_fills && fill_amount_sum) {
        /**
         * Currently the Execution order holds the price which is expected upon being fully filled.
         * We first need to how much the current fills are worth.
         */
        const price_to_spread = fill_amount_sum * placed_order.price / placed_order.total_quantity;

        [ err ] = await to(sequelize.query(`
            UPDATE execution_order_fill AS eof
            SET ${placed_order.fee ? `fee = ${placed_order.fee} * quantity / ${fill_amount_sum}, ` : ''}price = ${price_to_spread} * quantity / ${fill_amount_sum}
            WHERE eof.execution_order_id = ${placed_order.id}
        `));

        if(err) log(`[ERROR.7B] Error occured during fill price/fee calculation and update: ${err.message}`);
    }


    //If the sum is greater or equal to the required total quantity, mark the order as FullyFilled.
    //For now, just to be safe, if the order is filled will be done in the first step using the exchange order object.
    /*if(fill_amount_sum >= placed_order.total_quantity) {
        log(`[WARN.6B] Order ${placed_order.id} was fully filled. Marking as "FullyFilled"`);
        placed_order.status = FullyFilled;
        return placed_order.save();
    }*/

    //If there is some filling and the order is not marked as PartiallyFilled, update the status then.
    if(fill_amount_sum > 0 && placed_order.status === Placed) {
        log(`[WARN.7A] Order ${placed_order.id} has received it's first fill/fills. Marking it as "PartiallyFilled"`);
        placed_order.status = PartiallyFilled;
    }

    //In case changes were made to the order, but non of the previous conditions were triggered, calls save();
    if(placed_order.changed()){
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
const fetchOrderFromExchange = (placed_order, exchange, log) => {
    return new Promise(async (resolve, reject) => {
        let external_order = null;
        let err = null;

        const symbol = placed_order.instrument.symbol;
        const since = placed_order.placed_timestamp;

        const can_fetch_by_id = exchange.has['fetchOrder'];
        const can_fetch_open_orders = exchange.has['fetchOpenOrders'];
        const can_fetch_all_orders = exchange.has['fetchOrders'];
    
        //In case somehow the exchange does not support order retrieval at all.
        if(!can_fetch_by_id && !can_fetch_open_orders && !can_fetch_all_orders) {
            log(`[ERROR] Exchange ${exchange.name} has no method of retrieving the orders`);
            placed_order.failed_attempts++;
            return updateOrderStatus(placed_order, log, ExecutionOrderFill);
        }

        //Best case scenario, will attempt to retrieve the order by id.
        if(can_fetch_by_id && !external_order) {
            [ err, external_order ] = await to(exchange.fetchOrder(placed_order.external_identifier, symbol));
            if(err) return reject(err);
        }

        let external_orders = [];

        //Second best scenario will retrieve using open only orders (still less orders to check then with all orders)
        //NOTE: currently removed, as with openOrders, we can't get orders that failed or got fully filled.
        /*if(can_fetch_open_orders && !external_order) {
            [ err, external_orders ] = await to(exchnage.fetchOpenOrders(symbol, since));
            if(err) return reject(err);
        }*/

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
