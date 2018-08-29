'use strict';
const ccxtUtils = require('../utils/CCXTUtils');

//everyday, every 5 seconds
module.exports.SCHEDULE = '*/5 * * * *';
module.exports.NAME = 'ORD_ST_CHANGE';
module.exports.JOB_BODY = async (config, log) => {

    const models = config.models;
    const Instrument = models.Instrument;
    const RecipeOrder = models.RecipeOrder;
    const ExecutionOrder = models.ExecutionOrder;
    const ExecutionOrderFill = models.ExecutionOrderFill;
    const Op = models.Sequelize.Op;


    const RECIPE_ORDER_TERMINAL_STATUSES = [
        RECIPE_ORDER_STATUSES.Completed,
        RECIPE_ORDER_STATUSES.Rejected,
        RECIPE_ORDER_STATUSES.Cancelled,
        RECIPE_ORDER_STATUSES.Failed
    ];
    const EXECUTION_ORDER_ACTIVE_STATUSES = [
        EXECUTION_ORDER_STATUSES.Pending,
        EXECUTION_ORDER_STATUSES.Placed,
        EXECUTION_ORDER_STATUSES.PartiallyFilled
    ]

    //fetch recipe orders in non-terminal statuses
    return RecipeOrder.findAll({
        where: {
            status: {
                [Op.notIn]: RECIPE_ORDER_TERMINAL_STATUSES
            }
        },
        include: [Instrument]
    }).then(recipe_orders => {

        log(`1. Processing ${recipe_orders.length} non-terminal orders...`);

        return Promise.all(_.map(recipe_orders, (recipe_order, idx) => {
            //output formatted index for each order being processed
            log(`1.[${recipe_order.id}]. Processing non-terminal recipe order ${recipe_order.id} with status ${recipe_order.status}...`);
            
            return Promise.all([
                Promise.resolve(recipe_order),
                ExecutionOrder.findAll({
                    where: {
                        recipe_order_id: recipe_order.id
                    }
                })
            ]).then(order_and_execs => {

                const [recipe_order, execution_orders] = order_and_execs;
                
                log(`2.[${recipe_order.id}]. Checking ${execution_orders.length} execution orders for order ${recipe_order.id}...`);

                if (!_.isEmpty(execution_orders) && _.every(execution_orders, ['status', EXECUTION_ORDER_STATUSES.Failed])) {
                    log(`2.[TERM.${recipe_order.id}] All ${execution_orders.length} execution orders for ${recipe_order.id} are Failed! Setting failed order...`);
                    recipe_order.status = RECIPE_ORDER_STATUSES.Failed;

                    return recipe_order.save();
                }

                //if there are executing execution orders then the recipe order status needs to be set to executing
                //note that this is NOT a terminal operation for this job because next we analyze execution order fills
                //if it turns out that the fills (almost) fully cover the recipe order already, its
                //status will need to be set to complete
                let recipe_order_promise = recipe_order;
                if (recipe_order.status === RECIPE_ORDER_STATUSES.Pending && _.some(execution_orders, eo => EXECUTION_ORDER_ACTIVE_STATUSES.includes(eo.status))) {
                    log(`2.[INFO.${recipe_order.id}] Recipe order ${recipe_order.id} status was Pending, but there was at least one active execution order found! Setting to Executing...`);
                    recipe_order.status = RECIPE_ORDER_STATUSES.Executing;
                    recipe_order_promise = recipe_order.save()
                }

                return Promise.all([
                    Promise.resolve(recipe_order_promise),
                    ccxtUtils.getConnector(recipe_order.target_exchange_id),
                    ExecutionOrderFill.findAll({
                        where: {
                            execution_order_id: _.map(execution_orders, 'id')
                        }
                    })
                ]).then(order_and_connector_and_fills => {

                    const [recipe_order, connector, execution_order_fills] = order_and_connector_and_fills;

                    log(`3.[${recipe_order.id}]. Checking ${execution_order_fills.length} execution order fills of order ${recipe_order.id}...`);

                    const fills_sum_decimal =
                            _.map(execution_order_fills, 'quantity')
                            .map(qty => Decimal(qty))
                            .reduce((acc, current) => acc.plus(current), Decimal(0));

                    //fetch correct ccxt market or stub if there is no market for this pair
                    //technically an order should not exist in that case, so lets mark it failed 
                    const market = connector.markets[
                        recipe_order.side == ORDER_SIDES.Buy ? 
                        recipe_order.Instrument.symbol 
                        : recipe_order.Instrument.reverse_symbol()
                    ]
                    
                    if (market == null) {

                        log(`3.[TERM.${recipe_order.id}] Recipe order ${recipe_order.id} with instrument ${recipe_order.Instrument.symbol} and side ${recipe_order.side} had no viable markets for trading. Failing...`);
                        recipe_order.status = RECIPE_ORDER_STATUSES.Failed;

                        return recipe_order.save();
                    }

                    const balast_sum = Decimal(market.limits.amount.min || '0')
                    const adjusted_qnty = Decimal(recipe_order.quantity).minus(balast_sum);
                    //to consider the order fully filled we only need to cover a viable amount of quantity with fills
                    //if the remainder is smaller than allowed trading quantity then we leave it be
                    if (fills_sum_decimal.gte(adjusted_qnty)) {

                        log(`3.[TERM.${recipe_order.id}] Sum of execution order fills for recipe order ${recipe_order.id} is ${fills_sum_decimal.toString()}, which covers total recipe order quantity(-${balast_sum.toString()})${adjusted_qnty.toString()}, setting recipe order status to Completed...`);
                        recipe_order.status = RECIPE_ORDER_STATUSES.Completed;

                        return recipe_order.save();
                    }
                    
                    return Promise.resolve(recipe_order);
                })
            })  
        }))
    })
};