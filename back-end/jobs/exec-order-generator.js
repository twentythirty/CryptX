"use strict";

const ccxtUnified = require('../utils/ccxtUnified');

/**
 * Return the symbol for whichever currency is being sold in the context of this order, out of the order currency pair. 
 * Basically checks the instrument and the order side, returning the correct part of the pair based
 * on buy/sell info. Kept synchornous by assumption of realized `Instrument` field.
 * 
 * `order` - the order for which to return symbol being sold. Must have `Instrument` field realized
 */
const get_order_sold_symbol = (order) => {
    const order_instrument = order.Instrument; /* Instrument in order object is defined with capital I */
    const [tx_symbol, quote_symbol] = order_instrument.symbol.split('/');

    switch (order.side) {

        case ORDER_SIDES.Buy:
            return quote_symbol;
        case ORDER_SIDES.Sell:
            return tx_symbol;
        default:
            TE(`Unkown order side ${order.side} on order ` + "%o", order);
    }
};

let execution_active = [
    EXECUTION_ORDER_STATUSES.Pending,
    EXECUTION_ORDER_STATUSES.InProgress
];

//every day, every 5 minutes
module.exports.SCHEDULE = "0 */5 * * * *";
module.exports.NAME = "GEN_EXEC_OR";
module.exports.JOB_BODY = async (config, log) => {
    //reference shortcuts
    const models = config.models;
    const RecipeOrder = models.RecipeOrder;
    const RecipeOrderGroup = models.RecipeOrderGroup;
    const Instrument = models.Instrument;
    const ExecutionOrder = models.ExecutionOrder;
    const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
    const sequelize = models.sequelize;

    //settings should be injected before this point in db-config, so its safe to reference
    let trade_base = {
        BTC: SYSTEM_SETTINGS.BASE_BTC_TRADE,
        ETH: SYSTEM_SETTINGS.BASE_ETH_TRADE
    };
    const fuzzyness = SYSTEM_SETTINGS.TRADE_BASE_FUZYNESS;

    // fetch all recipe orders where of approved recipe order group
    return RecipeOrder.findAll({
        where: {
            status: RECIPE_ORDER_STATUSES.Executing
        },
        include: [
            Instrument,
            { 
                model: RecipeOrderGroup,
                where: {
                    approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved
                }
            }
        ]
    }).then(active_orders => {
        log(`1. Analyzing ${active_orders.length} active orders...`)
        return Promise.all(
            _.map(active_orders, pending_order => {

                const sold_symbol = get_order_sold_symbol(pending_order);
                console.log("Selling symbol: ", sold_symbol);
                const base_trade_amount = trade_base[sold_symbol];
                if (base_trade_amount == null) {
                    log(`[ERROR.2A]: no base trade recorded for currency symbol ${sold_symbol}! Skipping order ${pending_order.id}...`);
                    return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '2A' };
                }

                log(`2. Fetching all execution orders of recipe order ${pending_order.id}...`)

                return Promise.all([
                    Promise.resolve(pending_order),
                    // fetch execution order quantity and filled grouped by status
                    // if execution order was fully filled then 
                    sequelize.query(`
                        SELECT 
                            eo.status,
                            COUNT(*) execution_order_count,
                            COALESCE(SUM(eo.spend_amount), 0) as eo_spent,
                            COALESCE(SUM(
                                CASE WHEN eo.status IN (:done_statuses) AND fills.fills_cost IS NOT NULL
                                    THEN fills.fills_cost
                                    ELSE eo.spend_amount
                                END
                            ), 0) as spend_amount,
                            COALESCE(SUM(eo.total_quantity), 0) as total_quantity,
                            COALESCE(SUM(fills.filled), 0) as filled
                        FROM execution_order eo
                        LEFT JOIN LATERAL (
                            SELECT
                                SUM(eof.quantity) as filled,
                                SUM(
                                    CASE WHEN fee_asset.is_base=true
                                        THEN (eof.quantity * eof.price) + eof.fee -- add raw fee if it's in base asset
                                        ELSE (eof.quantity * eof.price) + (eof.fee * price) -- calculate cost with price
                                    END
                                ) as fills_cost
                            FROM execution_order_fill eof
                            LEFT JOIN asset fee_asset ON fee_asset.id=eof.fee_asset_id
                            WHERE eof.execution_order_id=eo.id
                            GROUP BY execution_order_id
                        ) as fills ON true
                        WHERE eo.recipe_order_id = :recipe_order_id
                        GROUP BY eo.status
                    `, {
                        replacements: {
                            recipe_order_id: pending_order.id,
                            done_statuses: [
                                EXECUTION_ORDER_STATUSES.FullyFilled,
                                EXECUTION_ORDER_STATUSES.PartiallyFilled
                            ]
                        },
                        type: sequelize.QueryTypes.SELECT
                    })
                ]).then(orderAndExecs => {

                    //if fulfilled orders cover the entire sum in the recipe order we set this to completed 
                    const [pending_order, execution_orders] = orderAndExecs;

                    //inspect existing execution orders of this pending one
                    const unfilled_execution = execution_orders.find(e => execution_active.includes(e.status));

                    if (unfilled_execution != null) {
                        //an active execution order was found, let system deal with it before attempting another one //${unfilled_execution.id}
                        log(`[WARN.3A]: Found execution orders  with status ${unfilled_execution.status} for pending recipe order ${pending_order.id}! Skipping recipe order...`);
                        return { instance: pending_order, status: JOB_RESULT_STATUSES.Skipped, step: '3A' };
                    }

                    const inactive_execution_orders = execution_orders.filter(e => !execution_active.includes(e.status));/*  _.filter(execution_orders, order => !order.isActive()); */
                    log(`3. Fetching all execution order fills for ${inactive_execution_orders.length} inactive execution orders of pending recipe order ${pending_order.id}`);
                    const resumable_execution_orders = execution_orders.filter(e => e.status==EXECUTION_ORDER_STATUSES.Failed);

                    log(`3.1. Reserving quantity for ${resumable_execution_orders.execution_order_count ?
                        resumable_execution_orders.execution_order_count : 0} failed but resumable execution orders...`);

                    return Promise.all([
                        Promise.resolve(pending_order),
                        //fetch mapping for exchange to instrument
                        InstrumentExchangeMapping.find({
                            where: {
                                exchange_id: pending_order.target_exchange_id,
                                instrument_id: pending_order.instrument_id
                            }
                        }),
                        //fetch CCXT connector for this exchange with markets preloaded
                        ccxtUnified.getExchange(pending_order.target_exchange_id),
                        //carry over resumable execution orders to add them to potentially covered total
                        Promise.resolve(resumable_execution_orders),
                        //fetch all finished execution order fills for all non-active execution orders
                        Promise.resolve(inactive_execution_orders)
                    ]).then(async (pendingAndMappingAndOrdersAndFills) => {

                        const [
                            pending_order,
                            exchange_mapping,
                            unifiedExchange,
                            resumable_amount,
                            execution_fills
                        ] = pendingAndMappingAndOrdersAndFills;

                        await unifiedExchange.isReady();
                        
                        log(`4a. retrieving market data with limits for ${pending_order.Instrument.symbol} for exchange with id ${pending_order.target_exchange_id}`);

                        if (!unifiedExchange._connector) {
                            log(`[ERROR.4A]: Failed to retrieve exchange connector with id: ${pending_order.target_exchange_id}`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '4A' };
                        }
                        if (unifiedExchange._connector.loading_failed) {
                            log(`[ERROR.4A]: Failed to load connector markets with id: ${pending_order.target_exchange_id}`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '4A' };
                        }
                        //Get market based on instrument symbol.
                        const exchange_market = unifiedExchange._connector.markets[pending_order.Instrument.symbol];

                        if (!exchange_market || !exchange_market.active) {
                            log(`[ERROR.4A]: Market for ${pending_order.Instrument.symbol} is not available or is not active`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '4A' };
                        }

                        const market_limits = exchange_market.limits;
                        const amount_limit = Object.assign({
                            min: 0.0,
                            max: Number.MAX_VALUE
                        }, market_limits.amount);

                        //if there is no mapping we quit early
                        if (exchange_mapping == null || exchange_mapping.tick_size == null) {
                            log(`[ERROR.3A] Exchange ${pending_order.exchange_id} and instrument ${pending_order.instrument_id} in recipe order ${pending_order.id} have no associating exchange mapping tick size! Skipping order...`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '3A' };
                        }

                        const failed_quantity = resumable_amount.length ? resumable_amount.spend_amount : 0;
                        const spent_total = Decimal(
                            execution_fills.reduce((acc, exec) => acc.add(Decimal(exec.spend_amount)), Decimal(0))
                        ).plus(Decimal(failed_quantity));

                        const order_total = Decimal(pending_order.spend_amount);
                        const remaining_sell_amount = order_total.minus(spent_total);

                        if (spent_total.gte(order_total)) {
                            log(`[WARN.3B]: Current fulfilled execution order total ${spent_total.toString()} covers recipe order ${pending_order.id} quantity ${pending_order.spend_amount}. Skipping recipe order...`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Skipped, step: '3B' };
                        }

                        const sold_symbol = get_order_sold_symbol(pending_order);
                        const base_trade_amount = trade_base[sold_symbol];
                        let fuzzy_trade_amount =
                            Decimal(base_trade_amount)
                            .mul(
                                Decimal(1).plus(_.random(-fuzzyness, fuzzyness, true))
                            );
                        //adjust fuzzy total to not be larger than remaning order quantity
                        if (fuzzy_trade_amount.gt(remaining_sell_amount)) {
                            fuzzy_trade_amount = remaining_sell_amount;
                        }

                        let limits = await unifiedExchange.getSymbolLimits(pending_order.Instrument.symbol);

                        let next_total = fuzzy_trade_amount;

                        if (next_total.lt(limits.spend.min)) {
                            log(`[WARN.4C]: Next total of ${next_total.toString()} is less than the markets min limit of ${amount_limit.min}`);
                            if (remaining_sell_amount.gte(limits.spend.min)) {
                                log(`[REC.4C]: Bumping total of new execution order for ${pending_order.id} to minimum supported ${amount_limit.min} since unrealized quantity ${remaining_sell_amount.toString()} allows it...`)
                                next_total = Decimal(limits.spend.min)
                            } else {
                                log(`[WARN.4C]: Skipping order generation since total remaining quantity ${remaining_sell_amount.toString()} is too low for required exchange minimum ${amount_limit.min}`);

                                pending_order.stop_gen = true;
                                await pending_order.save();
                    
                                return { instance: pending_order, status: JOB_RESULT_STATUSES.Skipped, step: '4C' };
                            }
                        }

                        if (next_total.gt(limits.spend.max)) {
                            log(`[WARN.4C]: Next total of ${next_total.toString()} is greater than the markets max limit of ${amount_limit.max}, setting the next total to limit\`s max ${amount_limit.max}`);
                            next_total = Decimal(limits.spend.max);
                        }

                        //reamining quantity for reciep order after this execution order gets generated
                        const next_order_spend = order_total.minus(next_total.plus(spent_total))
                        if (next_order_spend.lt(limits.spend.min)) {
                            log(`[WARN.4C]: Post-gen recipe order total of ${next_order_spend.toString()} is less than the markets min limit of ${limits.spend.min}. Adding remainder to current and finishing recipe order!`);
                            next_total = next_total.plus(next_order_spend);
                        }


                        //create next pending execution order and save it
                        return await Promise.all([
                            Promise.resolve(pending_order),
                            ExecutionOrder.create({
                                side: pending_order.side,
                                type: EXECUTION_ORDER_TYPES.Market,
                                spend_amount: next_total.toString(),
                                total_quantity: "0" || next_total.toString(),
                                status: EXECUTION_ORDER_STATUSES.Pending,
                                recipe_order_id: pending_order.id,
                                instrument_id: pending_order.instrument_id,
                                exchange_id: pending_order.target_exchange_id,
                                price: null,
                                failed_attempts: 0
                            })
                        ]);
                    });
                });
            })
        );
    }).catch(err => {
        console.log(err);
    });
};