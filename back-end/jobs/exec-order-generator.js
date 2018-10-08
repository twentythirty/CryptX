"use strict";

const ccxtUtils = require('../utils/CCXTUtils');

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

const fills_sum_decimal = (fills) => {
    return _.map(fills, 'quantity')
        .map(qty => Decimal(qty))
        .reduce((acc, current) => acc.plus(current), Decimal(0))
}

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
    const ExecutionOrderFill = models.ExecutionOrderFill;
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
                    sequelize.query(`
                        SELECT 
                            eo.status,
                            COUNT(*) execution_order_count,
                            COALESCE(SUM(eo.total_quantity), 0) as total_quantity,
                            COALESCE(SUM(eof.quantity),0) as filled
                        FROM execution_order eo
                        LEFT JOIN execution_order_fill eof ON eof.execution_order_id=eo.id
                        WHERE eo.recipe_order_id = :recipe_order_id
                        GROUP BY eo.status
                    `, {
                        replacements: {
                            recipe_order_id: pending_order.id
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
                        ccxtUtils.getConnector(pending_order.target_exchange_id),
                        //carry over resumable execution orders to add them to potentially covered total
                        Promise.resolve(resumable_execution_orders),
                        //fetch all finished execution order fills for all non-active execution orders
                        Promise.resolve(inactive_execution_orders)
                    ]).then(pendingAndMappingAndOrdersAndFills => {

                        const [
                            pending_order,
                            exchange_mapping,
                            exchange_connector,
                            resumable_amount,
                            execution_fills
                        ] = pendingAndMappingAndOrdersAndFills;

                        log(`4a. retrieving market data with limits for ${pending_order.Instrument.symbol} for exchange with id ${pending_order.target_exchange_id}`);

                        if (!exchange_connector) {
                            log(`[ERROR.4A]: Failed to retrieve exchange connector with id: ${pending_order.target_exchange_id}`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '4A' };
                        }
                        if (exchange_connector.loading_failed) {
                            log(`[ERROR.4A]: Failed to load connector markets with id: ${pending_order.target_exchange_id}`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Error, step: '4A' };
                        }
                        //Get market based on instrument symbol.
                        const exchange_market = exchange_connector.markets[pending_order.Instrument.symbol];

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


                        //sum up all quantities that could potentially be realized
                        const potential_qnatity = resumable_amount.length ?
                            Decimal(resumable_amount.total_quantity).minus(Decimal(resumable_amount.filled)) :
                            0;



                        //realized total is the sum of actual fills and potential quantity in resumable execution orders
                        const realized_total = Decimal(
                            execution_fills.reduce((acc, exec) => acc.add(Decimal(exec.filled)), Decimal(0))
                        ).plus(potential_qnatity);
                        const order_total = Decimal(pending_order.quantity)
                        const remain_quantity = order_total.minus(realized_total);

                        if (realized_total.gte(order_total)) {
                            log(`[WARN.3B]: Current fulfilled execution order total ${realized_total.toString()} covers recipe order ${pending_order.id} quantity ${pending_order.quantity}. Skipping recipe order...`);
                            return { instance: pending_order, status: JOB_RESULT_STATUSES.Skipped, step: '3B' };
                        }

                        const sold_symbol = get_order_sold_symbol(pending_order);
                        const base_trade_amount = trade_base[sold_symbol];
                        let fuzzy_trade_amount =
                            Decimal(base_trade_amount)
                            .div(pending_order.price) //divide base trading amoutn by tx asset price to know how much quantity we are actually buying
                            .mul(
                                Decimal(1).plus(_.random(-fuzzyness, fuzzyness, true))
                            );
                        //adjust fuzzy total to not be larger than remaning order quantity
                        if (fuzzy_trade_amount.gt(remain_quantity)) {
                            fuzzy_trade_amount = remain_quantity;
                        }

                        //minimize the DP to accepted levels
                        fuzzy_trade_amount = fuzzy_trade_amount.toDP(
                            Decimal(exchange_mapping.tick_size).dp(), Decimal.ROUND_HALF_DOWN
                        );
                        log(`4b. predicting fuzzy ${sold_symbol} amount ${fuzzy_trade_amount.toString()} reduced to tick size ${exchange_mapping.tick_size} for recipe order ${pending_order.id}...`);

                        //next total is either the fuzzy amount or order or market upper bound, whichever fits
                        let next_total = fuzzy_trade_amount;
                        log(`4c. actually using clamped fuzzy total ${next_total.toString()} of ${sold_symbol} on recipe order ${pending_order.id}`);

                        //Check if the next total is within the amount limit.

                        //check if the amounts are defined since the keys might exist but not have values on them
                        if (amount_limit.min) {
                            if (next_total.lt(amount_limit.min)) {
                                log(`[WARN.4C]: Next total of ${next_total.toString()} is less than the markets min limit of ${amount_limit.min}`);
                                if (remain_quantity.gte(amount_limit.min)) {
                                    log(`[REC.4C]: Bumping total of new execution order for ${pending_order.id} to minimum supported ${amount_limit.min} since unrealized quantity ${remain_quantity.toString()} allows it...`)
                                    next_total = Decimal(amount_limit.min)
                                } else {
                                    log(`[WARN.4C]: Skipping order generation since total remaining quantity ${remain_quantity.toString()} is too low for required exchange minimum ${amount_limit.min}`);
                                    return { instance: pending_order, status: JOB_RESULT_STATUSES.Skipped, step: '4C' };;
                                }
                            }
                        } else {
                            log(`[INFO.4C]: Skipping lower bound check on quantity ${next_total.toString()} for recipe order ${pending_order.id} due to missing lower bound on market ${exchange_market.symbol} for exchange ${exchange_connector.name}`);
                        }

                        if (amount_limit.max) {
                            if (next_total.gt(amount_limit.max)) {
                                log(`[WARN.4C]: Next total of ${next_total.toString()} is greater than the markets max limit of ${amount_limit.max}, setting the next total to limit\`s max ${amount_limit.max}`);
                                next_total = Decimal(amount_limit.max);
                            }
                        } else {
                            log(`[INFO.4C]: Skipping upper bound check on quantity ${next_total.toString()} for recipe order ${pending_order.id} due to missing upper bound on market ${exchange_market.symbol} for exchange ${exchange_connector.name}`);
                        }

                        //reamining quantity for reciep order after this execution order gets generated
                        const next_order_qnty = order_total.minus(next_total.plus(realized_total))
                        if (next_order_qnty.lt(amount_limit.min)) {
                            log(`[WARN.4C]: Post-gen recipe order total of ${next_order_qnty.toString()} is less than the markets min limit of ${amount_limit.min}. Adding remainder to current and finishing recipe order!`);
                            next_total = next_total.plus(next_order_qnty);
                        }

                        log(`4d. Current fulfilled recipe order total is ${realized_total.toString()}, adding another ${next_total.toString()}...`);

                        //create next pending execution order and save it
                        return Promise.all([
                            Promise.resolve(pending_order),
                            ExecutionOrder.create({
                                side: pending_order.side,
                                type: EXECUTION_ORDER_TYPES.Market,
                                total_quantity: next_total.toString(),
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