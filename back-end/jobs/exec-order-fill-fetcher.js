'use strict'

const ccxtUtils = require('../utils/CCXTUtils');
const { logAction } = require('../utils/ActionLogUtil');
const { eq, ne, in: opIn } = require('sequelize').Op;

const action_path = 'execution_orders';

const actions = {
    error: `${action_path}.error`,
    failed_attempts: `${action_path}.failed_attempts`,
    failed: `${action_path}.failed`,
    generate_fill: `${action_path}.generate_fill`,
    fully_filled: `${action_path}.fully_filled`,
    modified: 'modified'
};

module.exports.SCHEDULE = '0 */5 * * * *';
module.exports.NAME = 'FETCH_EXEC_OR_FILLS';
module.exports.JOB_BODY = async (config, log) => {

    const models = config.models;
    const sequelize = models.sequelize;
    const ExecutionOrder = models.ExecutionOrder;
    const ExecutionOrderFill = models.ExecutionOrderFill;
    const InstrumentMarketData = models.InstrumentMarketData;
    const { InProgress, NotFilled, PartiallyFilled, Failed, FullyFilled } = MODEL_CONST.EXECUTION_ORDER_STATUSES;

    //Fetch all execution orders that are placed on the exchange, not failed, canceled or pending and has an external identifier.
    log('1. Fetching all InProgress execution orders and it fills.')
    let [ err, placed_orders ] = await to(sequelize.query(`
        SELECT
            exo.*,
            iem.external_instrument_id AS external_instrument,
            ins.quote_asset_id AS instrument_quote_asset_id,
            quote_asset.symbol AS instrument_quote_asset,
            ins.transaction_asset_id AS instrument_transaction_asset_id,
            transaction_asset.symbol AS instrument_transaction_asset
        FROM execution_order AS exo
        LEFT OUTER JOIN instrument_exchange_mapping AS iem ON exo.exchange_id = iem.exchange_id and exo.instrument_id = iem.instrument_id
        JOIN instrument AS ins On exo.instrument_id = ins.id
        JOIN asset AS quote_asset ON ins.quote_asset_id = quote_asset.id
        JOIN asset AS transaction_asset ON ins.transaction_asset_id = transaction_asset.id
        WHERE exo.placed_timestamp IS NOT NULL AND exo.external_identifier IS NOT NULL AND exo.status = ${InProgress}
    `, { model: ExecutionOrder }))

    if(err) {
        logError(log, null, '[ERROR.1A]', 'placed orders retrieval from database', err);
        return;
    }

    if(!placed_orders.length) {
        log(`[WARN.1A] No orders in progress found, skipping...`);
        return;
    }

    let current_fills = [];
    [ err, current_fills ] = await to(ExecutionOrderFill.findAll({
        where : { 
            execution_order_id: { [opIn]: placed_orders.map(order => order.id) } 
        },
        raw: true,
        order: [ [ 'timestamp', 'DESC' ] ]
    }));

    if(err) {
        logError(log, null, '[ERROR.1B]', 'placed order fills retrieval from database', err);
        return;
    }

    const promise_all = Promise.all(_.map(placed_orders, async placed_order => {

        let queries = []; //Queries that will go into the sql transaction.
        let logs = [];    //Logs thatneed to be logged only after the successful sqltransaction

        const placed_order_fills = current_fills.filter(fill => fill.execution_order_id === placed_order.id);

        placed_order.filled_amount = placed_order_fills.reduce((prev, current) => {
            return prev.plus(current.quantity || 0);
        }, Decimal(0));
        
        log(`2.(EXEC-${placed_order.id}) Checking if order is simulated.`);
        let [ err, is_simulated ] = await to(module.exports.isSimulated(placed_order.id, models.sequelize));
        if(err) {
            logError(log, placed_order, `[ERROR.2A](EXEC-${placed_order.id})`, 'simulation checking', err);
            placed_order.failed_attempts++;
            return updateOrderStatus(placed_order, queries, logs);
        }

        if(is_simulated) {
            log(`2.(EXEC-${placed_order.id}) Attempting to simulate fills using market data.`);
            let result = [];

            [ err, result ] = await to(simulateFill(placed_order));

            if(err) {
                placed_order.status = placed_order.previous('status');
                placed_order.fee = placed_order.previous('fee');;
                placed_order.completed_timestamp = placed_order.previous('completed_timestamp');;
                placed_order.failed_attempts++;

                logError(log, placed_order, `[ERROR.2B](EXEC-${placed_order.id})`, 'simulation of fills', err);
                return updateOrderStatus(placed_order, queries, logs);
            }

            const [ new_queries, new_logs ] = result;
            queries = queries.concat(new_queries);
            logs = logs.concat(new_logs);


            return updateOrderStatus(placed_order, queries, logs);

        }

        log(`3.(EXEC-${placed_order.id}) Fetching exchange connector and external order from it.`);
        let exchange = null;
        [ err, exchange ] = await to(ccxtUtils.getConnector(placed_order.exchange_id));
        if(err) {
            logError(log, placed_order, `[ERROR.3A](EXEC-${placed_order.id})`, 'exchange connection fetching', err);
            placed_order.failed_attempts++;
            return updateOrderStatus(placed_order, actions, logs);
        }
        

        if(!exchange) {
            logError(log, placed_order, `[ERROR.3B](EXEC-${placed_order.id})`, 'exchange connection fetching', 'Unable to find exchange connection');
            placed_order.failed_attempts++;
            return updateOrderStatus(placed_order, queries, logs);
        }
        
        //Fetch the order object from the exchange.
        let external_order = null;
        
        [ err, external_order ] = await to(fetchOrderFromExchange(placed_order, exchange, log));
        
        if(err){
            logError(log, placed_order, `[ERROR.3C](EXEC-${placed_order.id})`, `order fetching from exchange ${exchange.name}`, err);
            placed_order.failed_attempts++; 
            return updateOrderStatus(placed_order, queries, logs);
        }

        if(!external_order) {
            logError(log, placed_order, `[ERROR.3D](EXEC-${placed_order.id})`, `order fetching from exchange ${exchange.name}`, `Could not find order with external id ${placed_order.external_identifier}`);
            placed_order.failed_attempts++; //Not marked as Failed, in case it's only a connection issue.
            return updateOrderStatus(placed_order, queries, logs);
        }
        /*
        console.log('\x1b[36m', `<<<<<<<<<<<<<<ORDER ${placed_order.id}/${placed_order.external_identifier}>>>>>>>>>>>>>>`, '\x1b[0m')
        console.log(JSON.stringify(external_order, null, 3));
        console.log('\x1b[36m', `<<<<<<<<<<<<<<ORDER ${placed_order.id}/${placed_order.external_identifier}>>>>>>>>>>>>>>`, '\x1b[0m')
        */

       log(`4.(EXEC-${placed_order.id}) Checking the current status of the order.`);
        /** 
         * When succesfully placed orders somehow fail during trading on the exchanges, CCXT library always marks them as 'closed'.
         * Instead of using a specific status name (ex: 'expired'). One way to identify this situations, is to check if the order was 'closed'
         * and then check if the order was not fully filled. In cases where the order was manually canceled, CCXT also marks it as 'closed', however,
         * it should be marked as canceled in the database, thus not appear in this job cycle naymore.
         */
        if(external_order.status === 'closed' && external_order.remaining > 0) {
            log(`[WARN.4A] Execution order ${placed_order.id} was closed on the exchange before getting filled, marking as Failed`);
            logs.push([actions.failed, {
                args: { reason: `Execution order was closed on ${exchange.name} before getting filled.` },
                relations: { execution_order_id: placed_order.id },
                log_level: ACTIONLOG_LEVELS.Warning
            }]);
            placed_order.status = Failed; //A temporary status to mark that the execution order cannot be changed anymore
            //The execution should continue, as there might be some more fills left to fetch
        }

        /**
         * Currently it's a bit hard to tell if all of the data will be synced completely accurately with the database.
         * Therefor, to make sure that the Execution order was filled fully, it will be check using the Order object
         * received from the exchange.
         * in CCXT, fully filled orders are 'closed'
         */
        if(external_order.status === 'closed' && external_order.remaining === 0){
            log(`[WARN.4B](EXEC-${placed_order.id}) Execution order ${placed_order.id} was closed and the remaining amount is equal to 0, marking as FullyFilled`);
            logs.push([actions.fully_filled, {
                relations: { execution_order_id: placed_order.id }
            }]);
            placed_order.status = FullyFilled;
            placed_order.completed_timestamp = new Date();
            //The execution will continue, as the job might be missing the last fill/fills.
        }

        //Flag that determines how to create new fills (using trades or calculating using the filled field of the order)
        const has_trades = exchange.has['fetchTrades'];

        log(`5.(EXEC-${placed_order.id}) Checking for new fills.`);
        let result = [];
        if(has_trades) {
            log(`[WARN.5A](EXEC-${placed_order.id}) Fetching trades is supported from exchange ${exchange.name} for order ${placed_order.id}`);
            
            [ err, result ] = await to(handleFillsWithTrades(placed_order, external_order, exchange, placed_order_fills));
  
            if(err) {
                logError(log, placed_order, `[ERROR.5A](EXEC-${placed_order.id})`, 'fetching trades from exchange', err);
                placed_order.failed_attempts++;
                return updateOrderStatus(placed_order, queries, logs);
            }

            const [ new_queries, new_logs ] = result;
            queries = queries.concat(new_queries);
            logs = logs.concat(new_logs);

            return updateOrderStatus(placed_order, queries, logs);
        }

        else {
            log(`[WARN.5B](EXEC-${placed_order.id}) Fetching trades is not supported for exchange ${exchange.name}, calculating fills by order details instead ${placed_order.id}`);
            
            result = handleFillsWithoutTrades(placed_order, external_order, placed_order_fills);

            const [ new_queries, new_logs ] = result;
            queries = queries.concat(new_queries);
            logs = logs.concat(new_logs);

            return updateOrderStatus(placed_order, queries, logs);
        }

    }));

    const handleFillsWithTrades = async (placed_order, external_order, exchange, fills = []) => {
        
        //To minimize the amount of retrieved trade entries, we will only take the ones since the last fill
        //or if there are no fills, then take the placement timestamp.
        const since = fills[0] ? fills[0].timestamp : placed_order.placed_timestamp;

        let [ err, trades ] = await to(exchange.fetchMyTrades(placed_order.get('external_instrument'), since));
    
        if(err) TE(err.message);
    
        if(!trades.length) {
            log(`[WARN.5C](EXEC-${placed_order.id}) No trades fetched, skipping...`);
            return [[], []];
        }

        //Check if exchange supports order identifiers for trades;
        const has_order_identifier = trades[0].order ? true : false;

        //For now this orders will be handled as if they couldn't retrieve the trades at all,
        //Since there is not good way to link the trade to a specific execution order.
        if(!has_order_identifier) {
            log(`[WARN.5D](EXEC-${placed_order.id}) Exchange ${exchange.name} trades don't have the order identifier, switching to tradeless fills method for order ${placed_order.id}`);
            return handleFillsWithoutTrades(placed_order, external_order, log, config);
        }

        //Get trades that are only associated with the current palce order.
        const order_trades = _.filter(trades, trade => trade.order === placed_order.external_identifier);

        //Safety filter to filter out trades that are already in the database.
        const new_trades = _.filter(order_trades, trade => _.findIndex(fills, { external_identifier: String(trade.id) }) === -1);

        if(!new_trades.length) {
            log(`[WARN.5E](EXEC-${placed_order.id}) No new trades found for order ${placed_order.id}, skipping...`);
            return [[], []];
        }
        
        log(`[WARN.5F](EXEC-${placed_order.id}) Found ${new_trades.length} trades.`);

        const new_fills = new_trades.map(trade => {
            const fee = trade.fee ? trade.fee.cost : 0;
            const fee_symbol = trade.fee ? trade.fee.currency : placed_order.get('instrument_quote_asset');
            const fee_id = trade.fee ? (trade.fee.currency === placed_order.get('instrument_quote_asset') ? placed_order.get('instrument_quote_asset_id') : placed_order.get('instrument_transaction_asset_id')) : placed_order.get('instrument_quote_asset_id');

            console.log('\x1b[36m', `<<<<<<<<<<<<<<TRADE ${placed_order.id}/${placed_order.external_identifier}>>>>>>>>>>>>>>`, '\x1b[0m')
            console.log(JSON.stringify(trade, null, 3));
            console.log('\x1b[36m', `<<<<<<<<<<<<<<TRADE ${placed_order.id}/${placed_order.external_identifier}>>>>>>>>>>>>>>`, '\x1b[0m')
            return {
                execution_order_id: placed_order.id,
                timestamp: trade.timestamp || Date.now(),
                quantity: trade.amount,
                external_identifier: String(trade.id),
                fee: fee,
                price: trade.price ? trade.price : placed_order.price,
                fee_asset_symbol: fee_symbol,
                fee_asset_id: fee_id
            }
        });

        if(placed_order.fee == null) placed_order.fee = 0;
        if(placed_order.price == null) placed_order.price = 0;

        const total_calculations = fills.concat(new_fills).reduce((prev, current) => {
            return _.assign(prev, {
                weighted_price: prev.weighted_price.plus(Decimal(current.price || 0).mul(current.quantity || 0)),
                quantity: prev.quantity.plus(current.quantity || 0),
                fee: prev.fee.plus(current.fee || 0)
            });
        }, {
            weighted_price: Decimal(0),
            quantity: Decimal(0),
            fee: Decimal(0)
        });

        placed_order.fee = total_calculations.fee.toString();
        placed_order.price = total_calculations.weighted_price.div(total_calculations.quantity).toString();
        placed_order.filled_amount = total_calculations.quantity;

        const new_logs = new_fills.map(fill => {
            return [actions.generate_fill, {
                args: { amount: fill.quantity },
                relations: { execution_order_id: placed_order.id }
            }];
        });

        return [
            [{
                model: ExecutionOrderFill,
                method: 'bulkCreate',
                args: [ new_fills ],
                options: {}
            }],
            new_logs
        ]
    };

    const handleFillsWithoutTrades = (placed_order, external_order, fills = []) => {

        //Check if the external_order has the order fee and price
        if(external_order.fee) placed_order.fee = external_order.fee.cost;
        if(external_order.price) placed_order.price = external_order.average || external_order.price; //Take the average price if possible

        const current_sums = fills.reduce((prev, current) => {
            return _.assign(prev, {
                fill: prev.fill.plus(current.quantity || 0),
                fee: prev.fee.plus(current.fee || 0)
            });
        }, {
            fill: Decimal(0),
            fee: Decimal(0)
        });

        if(current_sums.fill.gte(external_order.filled)) {
            log(`[WARN.5B](EXEC-${placed_order.id}) Filled amount does not exceed current sum of fills, skipping..`)
            return [[], []];
        };

        placed_order.filled_amount.plus(external_order.filled).minus(current_sums.fill);

        return [[
            {
                model: ExecutionOrderFill,
                method: 'create',
                args: [{
                    execution_order_id: placed_order.id,
                    timestamp: new Date(),
                    quantity: Decimal(external_order.filled).minus(current_sums.fill).toString(),
                    price: placed_order.price,
                    fee: placed_order.fee ? Decimal(placed_order.fee).minus(current_sums.fee).toString() : 0,
                    fee_asset_symbol: external_order.fee ? external_order.fee.currency : placed_order.get('instrument_quote_asset'),
                    fee_asset_id: external_order.fee ? (external_order.fee.curreny === placed_order.get('instrument_quote_asset') ? placed_order.get('instrument_quote_asset_id') : placed_order.get('instrument_transaction_asset_id')) : placed_order.get('instrument_quote_asset_id')
                }],
                options: {}
            }
        ], [
            [actions.generate_fill, {
                args: { amount: Decimal(external_order.filled).minus(current_sums.fill).toString() },
                relations: { execution_order_id: placed_order.id }
            }]
        ]]
    }

    const simulateFill = async (placed_order) => {
    
        let [ err, market_data ] = await to(InstrumentMarketData.findOne({
            where: {
                instrument_id: placed_order.instrument_id,
                exchange_id: placed_order.exchange_id
            },
            order: [ [ 'timestamp', 'DESC' ] ]
        }));
    
        if(err) TE(err.message);
    
        if(!market_data) TE(`No market data was available.`)
        
        let price = 0;
        switch(placed_order.side) {
    
            case ORDER_SIDES.Sell:
                price = market_data.bid_price;
                break
            
            case ORDER_SIDES.Buy:
            default:
                price = market_data.ask_price;
    
        }
        const fee = price/_.random(98, 100, false); //Make fee around 1-3% of the price.
        
        placed_order.price = price;
        placed_order.fee = fee;
        placed_order.status = MODEL_CONST.EXECUTION_ORDER_STATUSES.FullyFilled;
        placed_order.completed_timestamp = new Date();

        return [[{
            model: ExecutionOrderFill,
            method: 'create',
            args: [{
                execution_order_id: placed_order.id,
                price: price,
                fee: fee,
                fee_asset_id: placed_order.get('instrument_quote_asset_id'),
                fee_asset_symbol: placed_order.get('instrument_quote_asset'),
                quantity: parseFloat(placed_order.total_quantity),
                timestamp: new Date()
            }],
            options: {}
        }], [
            [
                actions.generate_fill, 
                {
                    args: { amount: parseFloat(placed_order.total_quantity) },
                    relations: { execution_order_id: placed_order.id }
                }
            ],
            [
                actions.fully_filled, 
                {
                    relations: { execution_order_id: placed_order.id }
                }
            ]
        ]];
    
    };

    const updateOrderStatus = async (placed_order, queries = [], logs = []) => {

        if(placed_order.failed_attempts >= SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE) {
            placed_order.status = placed_order.filled_amount.gt(0) ? PartiallyFilled : NotFilled;
            logs.push([actions.failed_attempts, {
                relations: { execution_order_id: placed_order.id },
                log_level: ACTIONLOG_LEVELS.Warning,
                args: { attempts: placed_order.failed_attempts }
            }]);
        }

        //In this case theexecution order was closed on the exchange after being placed there. We should change the status.

        if(placed_order.status === Failed) placed_order.status = placed_order.filled_amount.gt(0) ? PartiallyFilled : NotFilled;

        if(placed_order.changed()) {
            queries.push({ model: placed_order, method: 'save', args: [], options: {} });
            logs.push([actions.modified, {
                previous_instance: Object.assign({}, placed_order._previousDataValues),
                updated_instance: placed_order,
                ignore: ['Instrument', 'completed_timestamp'],
                replace: {
                    status: {
                        [Failed]: `{execution_orders.status.${Failed}}`,
                        [InProgress]: `{execution_orders.status.${InProgress}}`,
                        [PartiallyFilled]: `{execution_orders.status.${PartiallyFilled}}`,
                        [FullyFilled]: `{execution_orders.status.${FullyFilled}}`,
                        [NotFilled]: `{execution_orders.status.${NotFilled}}`
                    }
                }
            }])
        }

        if(!queries.length) return; //If nothing needs to be done, just end it.

        log(`6.(EXEC-${placed_order.id}) Saving changes to the database.`);

        let [ err, result ] = await to(sequelize.transaction(transaction => {
            return queries.reduce((previous, current) => {
                 return previous.then(() => {
                     let args = [];

                     if(!_.isEmpty(current.args)) args = args.concat(current.args);

                     args.push(Object.assign({}, current.options, { transaction }));

                     return current.model[current.method](...args);
                 });
            }, Promise.resolve()); 
         }));

         if(err) return logError(log, placed_order, '[ERROR.6A]', 'changes being saved to the database', err);

         logs.map(l => logAction(...l));

         return queries;

    }

    return promise_all;

}

/**
 * Fetches order details from the exchange based on the database entry.
 * Depending on the exchange, may use different methods.
 * @param {Object} placed_order 
 * @param {Object} exchange 
 */
const fetchOrderFromExchange = async (placed_order, exchange, log) => {
        let external_order = null;
        let err = null;
  
        const symbol = placed_order.get('external_instrument');
        const since = placed_order.placed_timestamp;

        const can_fetch_by_id = exchange.has['fetchOrder'];
        const can_fetch_open_orders = exchange.has['fetchOpenOrders'];
        const can_fetch_all_orders = exchange.has['fetchOrders'];
    
        //In case somehow the exchange does not support order retrieval at all.
        if(!can_fetch_by_id && !can_fetch_open_orders && !can_fetch_all_orders) {
            TE(`Exchange ${exchange.name} has no way of fetching order information.`);
        }

        //Best case scenario, will attempt to retrieve the order by id.
        if(can_fetch_by_id && !external_order) {
            [ err, external_order ] = await to(exchange.fetchOrder(placed_order.external_identifier, symbol));
            if(err) TE(err);
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
            [ err, external_orders ] = await to(exchange.fetchOrders(symbol, since));
            if(err) TE(err);
        }

        //If multiple orders were received instead of one by id, search the array for the corresponding order.
        if(external_orders.length) {
            external_order = _.find(external_orders, { id: placed_order.external_identifier });
        }

        return external_order;
};

//Exported for stubing
module.exports.isSimulated = async (execuiton_id, sequelize) => {
    const [ err, row ] = await to(sequelize.query(`
        SELECT
            ir.is_simulated
        FROM execution_order AS ex 
        JOIN recipe_order AS ro ON ex.recipe_order_id = ro.id
        JOIN recipe_order_group AS rog ON ro.recipe_order_group_id = rog.id
        JOIN recipe_run AS rr on rog.recipe_run_id = rr.id
        JOIN investment_run AS ir ON rr.investment_run_id = ir.id
        WHERE ex.id = ${execuiton_id}
    `,
        { type: sequelize.QueryTypes.SELECT }
    ));

    if(err) TE(err.message);
    if(!row.length) return false;
    
    return row[0].is_simulated;
};

const logError = async (log, placed_order, tag = '[ERROR]', when = '', error) => {
    console.error(JSON.stringify(error));
    const error_message = _.isObject(error) ? error.message : error;

    log(`${tag} Error occured during ${when}: ${error_message}`);
    logAction(actions.error, {
        args: { error: `Error occured during ${when}: ${error_message}` },
        relations: { execution_order_id: placed_order ? placed_order.id : null },
        log_level: ACTIONLOG_LEVELS.Error
    });
};