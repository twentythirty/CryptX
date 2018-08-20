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

    //settings should be injected before this point in db-config, so its safe to reference
    let trade_base = {
        BTC: SYSTEM_SETTINGS.BASE_BTC_TRADE,
        ETH: SYSTEM_SETTINGS.BASE_ETH_TRADE
    };
    const fuzzyness = SYSTEM_SETTINGS.TRADE_BASE_FUZYNESS;

    const approved_groups_ids = _.map(await RecipeOrderGroup.findAll({
        where: {
            approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved
        }
    }), 'id');

    return RecipeOrder.findAll({
        where: {
            status: RECIPE_ORDER_STATUSES.Executing,
            recipe_order_group_id: approved_groups_ids
        },
        include: [Instrument]
    }).then(active_orders => {
        log(`1. Analyzing ${active_orders.length} active orders...`)
        return Promise.all(
            _.map(active_orders, pending_order => {

                const sold_symbol = get_order_sold_symbol(pending_order);
                console.log("Selling symbol: ", sold_symbol);
                const base_trade_amount = trade_base[sold_symbol];
                if (base_trade_amount == null) {
                    log(`[ERROR.2A]: no base trade recorded for currency symbol ${sold_symbol}! Skipping order ${pending_order.id}...`);
                    return pending_order;
                }

                log(`2. Fetching all execution orders of recipe order ${pending_order.id}...`)

                return Promise.all([
                    Promise.resolve(pending_order),
                    ExecutionOrder.findAll({
                        where: {
                            recipe_order_id: pending_order.id
                        }
                    })
                ]).then(orderAndExecs => {

                    //if fulfilled orders cover the entire sum in the recipe order we set this to completed 
                    const [pending_order, execution_orders] = orderAndExecs;

                    //inspect existing execution orders of this pending one
                    const unfilled_execution = _.find(execution_orders, order => order.isActive());

                    if (unfilled_execution != null) {
                        //an active execution order was found, let system deal with it before attempting another one
                        log(`[WARN.3A]: Found execution order ${unfilled_execution.id} with status ${unfilled_execution.status} for pending recipe order ${pending_order.id}! Skipping recipe order...`);
                        return pending_order;
                    }

                    const inactive_execution_orders = _.filter(execution_orders, order => !order.isActive());
                    log(`3. Fetching all execution order fills for ${inactive_execution_orders.length} inactive execution orders of pending recipe order ${pending_order.id}`);
                    const resumable_execution_orders = _.filter(execution_orders, order => order.status == EXECUTION_ORDER_STATUSES.Failed && order.failed_attempts < SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE);

                    log(`3.1. Reserving quantity for ${resumable_execution_orders.length} failed but resumable execution orders...`);

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
                        ExecutionOrderFill.findAll({
                            where: {
                                execution_order_id: _.map(inactive_execution_orders, 'id')
                            }
                        })
                    ]).then(pendingAndMappingAndOrdersAndFills => {

                        const [
                            pending_order,
                            exchange_mapping,
                            exchange_connector,
                            resumable_execution_orders,
                            execution_fills
                        ] = pendingAndMappingAndOrdersAndFills;

                        log(`4a. retrieving market data with limits for ${pending_order.Instrument.symbol} for exchange with id ${pending_order.target_exchange_id}`);

                        if (!exchange_connector) {
                            log(`[ERROR.4A]: Failed to retrieve exchange connector with id: ${pending_order.target_exchange_id}`);
                            return pending_order;
                        }
                        //Get market based on instrument symbol.
                        const exchange_market = exchange_connector.markets[pending_order.Instrument.symbol];

                        if (!exchange_market || !exchange_market.active) {
                            log(`[ERROR.4A]: Market for ${pending_order.Instrument.symbol} is not available or is not active`);
                            return pending_order;
                        }

                        const market_limits = exchange_market.limits;
                        const amount_limit = market_limits.amount;

                        //if there is no mapping we quit early
                        if (exchange_mapping == null || exchange_mapping.tick_size == null) {
                            log(`[ERROR.3A] Exchange ${pending_order.exchange_id} and instrument ${pending_order.instrument_id} in recipe order ${pending_order.id} have no associating exchange mapping tick size! Skipping order...`);
                            return pending_order;
                        }


                        //sum up all quantities that could potentially be realized
                        const potential_qnatity = _.map(resumable_execution_orders, execution_order => {
                            const fills_sum = fills_sum_decimal(
                                _.filter(execution_fills, fill => fill.execution_order_id == execution_order.id)
                            )
                            return Decimal(execution_order.total_quantity).minus(fills_sum)
                        }).reduce((acc, current) => acc.plus(current), Decimal(0))


                        //realized total is the sum of actual fills and potential quantity in resumable execution orders
                        const realized_total = fills_sum_decimal(execution_fills).plus(potential_qnatity)
                        const order_total = Decimal(pending_order.quantity)
                        const remain_quantity = order_total.minus(realized_total);

                        if (realized_total.gte(order_total)) {
                            log(`[WARN.3B]: Current fulfilled execution order total ${realized_total.toString()} covers recipe order ${pending_order.id} quantity ${pending_order.quantity}. Skipping recipe order...`);
                            return pending_order;
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
                        if (next_total.lt(amount_limit.min)) {
                            log(`[WARN.4C]: Next total of ${next_total.toString()} is less than the markets min limit of ${amount_limit.min}`);
                            if (remain_quantity.gte(amount_limit.min)) {
                                log(`[REC.4C]: Bumping total of new execution order for ${pending_order.id} to minimum supported ${amount_limit.min} since unrealized quantity ${remain_quantity.toString()} allows it...`)
                                next_total = Decimal(amount_limit.min)
                            } else {
                                log(`[WARN.4C]: Skipping order generation since total remaining quantity ${remain_quantity.toString()} is too low for required exchange minimum ${amount_limit.min}`);
                                return pending_order;
                            }
                        }

                        if (next_total.gt(amount_limit.max)) {
                            log(`[WARN.4C]: Next total of ${next_total.toString()} is greater than the markets max limit of ${amount_limit.max}, setting the next total to limit\`s max ${amount_limit.max}`);
                            next_total = Decimal(amount_limit.max);
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
    });
};