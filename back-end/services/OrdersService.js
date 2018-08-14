'use strict';


const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;
const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeOrder = require('../models').RecipeOrder;
const ExecutionOrder = require('../models').ExecutionOrder;
const ExchangeAccount = require('../models').ExchangeAccount;
const Instrument = require('../models').Instrument;
const Asset = require('../models').Asset;
const InstrumentExchangeMapping = require('../models').InstrumentExchangeMapping;
const InstrumentMarketData = require('../models').InstrumentMarketData;
const Op = require('../models').Sequelize.Op;
const ccxtUtils = require('../utils/CCXTUtils');

/**
 * Check if 2 Instrument objects are using the same assets (by id)
 */
const sameAssets = (obj1, obj2) => {

    return (
        (obj1.transaction_asset_id == obj2.transaction_asset_id &&
            obj1.quote_asset_id == obj2.quote_asset_id) ||
        (obj1.quote_asset_id == obj2.transaction_asset_id &&
            obj1.transaction_asset_id == obj2.quote_asset_id)
    )
}

/**
 * Returns current available funds from the completed deposits of the context recipe run
 * for the specified exchanges.
 * 
 * data is returned in the format of
 * 
 * ```
 * {
 *  [exchange_id]: {
 *    [asset_id]: {
 *       amount: [money],
 *       investment_prc: [cumulative percentage decimal]
 *      },
 *    [asset_id]: {
 *       amount: [money],
 *       investment_prc: [cumulative percentage decimal]
 *    }
 *  ...
 *  }
 * }
 * ``` 
 * 
 * `recipe_run_id` - recipe run context of deposits
 * 
 * `exchange_ids` - Identifiers of exchanges to get balance for. should be a list
 */
const fetch_exchange_deposits = async (recipe_run_id, exchange_ids) => {

    const exchange_accounts = await ExchangeAccount.findAll({
        where: {
            exchange_id: exchange_ids
        }
    });

    //fetch all completed deposits of this run for specified exchanges
    //fetch along with recipe rundetails to calculate percentages
    return Promise.all([
        RecipeRunDeposit.findAll({
            where: {
                recipe_run_id: recipe_run_id,
                target_exchange_account_id: _.map(exchange_accounts, 'id'),
                status: RECIPE_RUN_DEPOSIT_STATUSES.Completed
            }
        }),
        RecipeRunDetail.findAll({
            where: {
                recipe_run_id: recipe_run_id,
                target_exchange_id: exchange_ids
            }
        })
    ]).then(deposits_rdetails => {

        const [deposits, recipe_run_details] = deposits_rdetails;

        //exchange account lookup
        const exchanges_mapping = _.keyBy(exchange_accounts, 'id')

        //group deposit objects by what exchange they are referring to
        // creating mappings [exchange_id]: <deposit>
        const grouped_deposits = _.groupBy(deposits, deposit => exchanges_mapping[deposit.target_exchange_account_id].exchange_id);

        //group recipe run details by what exchange they belong to for convenient filtering
        const grouped_details = _.groupBy(recipe_run_details, 'target_exchange_id')

        //construct list of described protocol objects
        return _.fromPairs(_.map(grouped_deposits, (deposits, exchange_id) => {

            return [
                exchange_id,
                _.fromPairs(_.map(deposits, deposit => {

                    const relevant_details = _.filter(grouped_details[exchange_id], detail => detail.quote_asset_id == deposit.asset_id)
                    const investment_prc_decimal =
                        _.map(relevant_details, 'investment_percentage')
                        .map(prc => Decimal(prc))
                        .reduce((acc, current) => acc.plus(current), Decimal(0));

                    return [
                        deposit.asset_id,
                        {
                            amount: deposit.amount,
                            investment_prc: investment_prc_decimal
                        }
                    ]
                }))
            ]
        }));
    });
}

/**
 * 
 * Find which `market_data_key` corresponds to the provided recipe run detail 
 * by instrument and exchange, though instrument may be reversed.
 * 
 * `market_data_keys` - keys to check
 * `instruments_by_id` - instruments lookup for checking
 * `recipe_run_detail` - detail to check against
 */
const marketDataKeyForRunDetail = (market_data_keys, instruments_by_id, recipe_run_detail) => {

    return _.find(market_data_keys, key => {
        const [key_instrument_id, key_exchange_id] = key.split(",").map(str_id => parseInt(str_id, 10));
        return (
            key_exchange_id == recipe_run_detail.target_exchange_id &&
            sameAssets(instruments_by_id[key_instrument_id], recipe_run_detail)
        )
    });
}

const generateApproveRecipeOrders = async (recipe_run_id) => {

    //check if there already is a non-rejected recipe order group for this recipe
    const existing_group = await RecipeOrderGroup.findOne({
        where: {
            recipe_run_id: recipe_run_id,
            approval_status: {
                [Op.ne]: RECIPE_ORDER_GROUP_STATUSES.Rejected
            }
        }
    });
    if (existing_group) {
        TE(`Recipe run ${recipe_run_id} already has a non-rejected orders group ${existing_group.id} with status ${existing_group.approval_status}, wont generate more!`);
    }

    const recipe_run = await RecipeRun.findById(recipe_run_id);

    if (recipe_run.approval_status != RECIPE_RUN_STATUSES.Approved) {
        TE(`Recipe run ${recipe_run_id} was not approved! was ${recipe_run.approval_status}.`);
    }

    //check deposits
    const incomplete_deposits = await RecipeRunDeposit.findAll({
        where: {
            recipe_run_id: recipe_run_id,
            status: {
                [Op.ne]: RECIPE_RUN_DEPOSIT_STATUSES.Completed
            }
        }
    })
    if (incomplete_deposits.length > 0) {
        TE(`${incomplete_deposits.length} incomplete deposits found: ${_.join(_.map(incomplete_deposits, 'id'), ', ')}! Please complete these before generating orders.`)
    }

    //fetch all individual recipe run details
    const recipe_run_details = await RecipeRunDetail.findAll({
        where: {
            recipe_run_id: recipe_run_id
        }
    });
    //according to spec and system flow this shouldnt be possible, but occurs frequently
    if (recipe_run_details.length <= 0) {
        TE(`Can't generate orders for recipe run ${recipe_run_id} due to missing recipe run details!`)
    }

    //fetch all asset ids involved in this venture
    // (to more concisely fetch involved instruments)
    const asset_ids = _.uniq(_.flatMap(recipe_run_details, recipe_run_detail => {
        return [recipe_run_detail.transaction_asset_id, recipe_run_detail.quote_asset_id]
    }));

    //fetch all instruments corresponding to detail assets
    //map them by instrument id
    const instruments_by_id = _.keyBy(await Instrument.findAll({
        where: {
            transaction_asset_id: asset_ids,
            quote_asset_id: asset_ids
        }
    }), 'id');

    //find out what sort of exchanges are mapped to the fetched instruments
    //group by instruments that are allowed on those exchanges
    const grouped_exchanges = _.groupBy(await InstrumentExchangeMapping.findAll({
        where: {
            instrument_id: Object.keys(instruments_by_id)
        }
    }), 'instrument_id');
    const flat_exchange_mappings_list = _.flatMap(Object.values(grouped_exchanges));

    //get latest ask/bid for those pairs (first element in group is latest)
    //grouped into {
    // [instrument_id, exchange_id]: [{market_data}, {market_data}...], 
    // [instrument_id, exchange_id]: [{market_data}, {market_data}...], 
    // ...
    //}
    //while having instrument objects in the keys would be more
    // convenient, JS doesnt support that

    const grouped_market_data = _.groupBy(await InstrumentMarketData.findAll({
        where: {
            instrument_id: Object.keys(grouped_exchanges),
            //extract value lists from grouped association, flatten those lists and extract property from entries
            exchange_id: _.map(flat_exchange_mappings_list, 'exchange_id')
            /* 
-----------------------------------------------------------------------------------------------------------------
            applied fix. Need to assure if this is fix works as intended.
            before exchange_id was: _.flatMap(_.map(grouped_exchanges, 'exchange_id'));
            map didn't find exchange_id as it was nested inside array element. */
        },
        order: [
            ['timestamp', 'DESC']
        ]
    }), market_data => {
        return [market_data.instrument_id, market_data.exchange_id]
    });
    const recipe_detail_exchange_ids = _.map(recipe_run_details, 'target_exchange_id');
    //fetch balance info from exchanges
    const exchange_deposits = await fetch_exchange_deposits(recipe_run_id, recipe_detail_exchange_ids);

    //filter out recipe run detailes where we dont have the info
    const market_data_keys = Object.keys(grouped_market_data);
    const valid_recipe_run_details = _.filter(recipe_run_details, recipe_run_detail => {

        //is there market data 
        //for assets of recipe on exchange of recipe
        const market_data = marketDataKeyForRunDetail(market_data_keys, instruments_by_id, recipe_run_detail);
        //is there a deposit in the currency we wish to sell
        const deposit = exchange_deposits[recipe_run_detail.target_exchange_id];
        //deposit is valid if there is money of the quote asset and its described as some percentage of total
        const deposit_valid = (
            deposit != null &&
            deposit[recipe_run_detail.quote_asset_id] != null &&
            deposit[recipe_run_detail.quote_asset_id].amount > 0.0 &&
            deposit[recipe_run_detail.quote_asset_id].investment_prc != null &&
            deposit[recipe_run_detail.quote_asset_id].investment_prc.toNumber() > 0.0 &&
            deposit[recipe_run_detail.quote_asset_id].investment_prc.toNumber() >= recipe_run_detail.investment_percentage
        );

        //if either is missing, this is a bad recipe detail and will be ignored
        if (market_data && deposit_valid) {
            return true;
        } else {
            console.log(`
            WARN: Skipping recipe run detail due to missing info/no deposit/bad deposit sum! 
            Recipe run detail id: ${recipe_run_detail.id}
            Detail exchange id: ${recipe_run_detail.target_exchange_id}
            Detail proposed trade: ${recipe_run_detail.transaction_asset_id}/${recipe_run_detail.quote_asset_id}
            Detail percentage: ${recipe_run_detail.investment_percentage}\n
            Deposit info: ${deposit == null? 'NONE' : JSON.stringify(deposit)}`);
            return false;
        }
    });
    if (valid_recipe_run_details.length == 0) TE(`no valid recipe run details! Check WARN messages...`);

    //run details filtered, generating orders group for orders
    let [err, orders_group] = await to(RecipeOrderGroup.create({
        created_timestamp: new Date(),
        approval_status: RECIPE_ORDER_GROUP_STATUSES.Pending,
        approval_timestamp: null,
        approval_comment: '',
        approval_user_id: null,
        recipe_run_id: recipe_run_id
    }));
    if (err || !orders_group) TE(`error creating orders group: ${err}`, err);

    let results = [];

    //fetch connectors since many exchanges 
    const connectors = await ccxtUtils.allConnectors(recipe_detail_exchange_ids);

    //create saving futures for orders from recipe run details
    [err, results] = await to(Promise.all(_.map(valid_recipe_run_details, recipe_run_detail => {

        const market_data_key = marketDataKeyForRunDetail(market_data_keys, instruments_by_id, recipe_run_detail);
        //if the market data and recipe run detail use the same base currency
        //then we use the bid price and make a buy order
        const market_data = grouped_market_data[market_data_key][0];
        const instrument = instruments_by_id[market_data.instrument_id];
        const buy_order = recipe_run_detail.transaction_asset_id == instrument.transaction_asset_id;

        //get correct price/order side, use precise division if possible
        const price = (buy_order ? market_data.bid_price : Decimal(1).div(Decimal(market_data.bid_price)).toString());
        const side = buy_order ? ORDER_SIDES.Buy : ORDER_SIDES.Sell;
        //get deposit object in base currency (includes amount and investemnt percentage)
        const relevant_deposit = exchange_deposits[recipe_run_detail.target_exchange_id][buy_order ? recipe_run_detail.quote_asset_id : recipe_run_detail.transaction_asset_id];

        const decimal_100 = Decimal('100');
        //create adjustment coeficient to know how to scale detail percentages
        const investment_prc_adjustment = decimal_100.div(relevant_deposit.investment_prc)
        //reciep order quantity, scaled but not adjusted by order type and tick size (happens later)
        const order_qnty_unadjusted =
            //multiply known deposited amount
            Decimal(relevant_deposit.amount).mul(
                //by how many percent go into this detail, scaled by how much of total deposit this asset takes up
                investment_prc_adjustment.mul(Decimal(recipe_run_detail.investment_percentage)).div(decimal_100)
            )

        //get mapping tick size as decimal
        const correct_mapping = _.find(
            flat_exchange_mappings_list, {
                instrument_id: market_data.instrument_id,
                exchange_id: recipe_run_detail.target_exchange_id
            }
        );
        const tick_size_decimal = correct_mapping == null ? null : Decimal(correct_mapping.tick_size);
        //round qnty to same dp as tick size, rounding down (only perform rounding if tick size was defined)
        //divide by price if this is a buy order
        const qnty_decimal = (
            tick_size_decimal == null ?
            order_qnty_unadjusted : order_qnty_unadjusted.toDP(tick_size_decimal.dp(), Decimal.ROUND_HALF_DOWN)
        ).div(buy_order ? Decimal(price) : Decimal(1))

        const connector = connectors[recipe_run_detail.target_exchange_id];
        const check_symbol = buy_order? instrument.symbol : instrument.reverse_symbol();
        const check_market = connector.markets[check_symbol];

        //found no market or market required quantity is larger than order quantity
        if (
            check_market == null ||
            Decimal(check_market.limits.amount.min || '0').gte(qnty_decimal)
        ) {
            console.log(`
            WARN: Skipping generating recipe order 
            for exchange ${connector.name} and market ${check_symbol}
            with quantity ${qnty_decimal.toString()}
            due to ${check_market == null? `no market for symbol ${check_symbol}!` : `unsatisfied market lower quantity bound: ${check_market.limits.amount.min}`}`)

            return Promise.resolve(null);
        }

        return RecipeOrder.create({
            recipe_order_group_id: orders_group.id,
            instrument_id: market_data.instrument_id,
            target_exchange_id: recipe_run_detail.target_exchange_id,
            price: price,
            quantity: qnty_decimal.toString(),
            side: side,
            status: RECIPE_ORDER_STATUSES.Pending
        });
    })));

    if (err) TE(`Error saving new recipe orders based on recipe run details: ${err}`, err);

    //filter out non-generated null reicpe orders (skipped due to low quantity)
    return _.filter(results, order => order != null);
}
module.exports.generateApproveRecipeOrders = generateApproveRecipeOrders;


const changeRecipeOrderGroupStatus = async (user_id, order_group_id, status, comment = null) => {

    if (user_id == null || order_group_id == null) {
        TE(`Can't alter recipe order group with null user_id or null order_group_id!`);
    }
    if (!Object.values(RECIPE_ORDER_GROUP_STATUSES).includes(status)) {
        TE(`Supplied status ${status} is not within allowed statuses of recipe order!`);
    }
    if ((status == RECIPE_ORDER_GROUP_STATUSES.Approved || status == RECIPE_ORDER_GROUP_STATUSES.Rejected) &&
        comment == null) {
        TE(`Must provide comment when approving or rejecting recipe orders group!`);
    }

    const recipe_order_group = await RecipeOrderGroup.findById(order_group_id);
    if (recipe_order_group == null) {
        TE(`Recipe order group for id ${recipe_order_group_id} was not found!`);
    }

    if (status === RECIPE_ORDER_GROUP_STATUSES.Approved && recipe_order_group.approval_status !== RECIPE_ORDER_GROUP_STATUSES.Pending) {
        TE('You are not allowed to approve orders that were already approved or rejected');
    }

    //status already same, low warning and exist as NOOP
    if (recipe_order_group.approval_status == status) {
        console.warn(`Recipe Order Group ${order_group_id} already has status ${status}! exiting...`);
        return recipe_order_group;
    }

    let update_group_promise = Promise.resolve(recipe_order_group).then(recipe_order_group => {

        //change recipe order group properties due to approval
        Object.assign(recipe_order_group, {
            approval_status: status,
            approval_user_id: user_id,
            approval_timestamp: new Date(),
            approval_comment: (comment != null) ? comment : recipe_order_group.approval_comment
        });

        return recipe_order_group.save();
    });

    //if the group is being rejected, have to reject all the orders as well
    if (status == RECIPE_ORDER_GROUP_STATUSES.Rejected) {

        update_group_promise = update_group_promise.then(recipe_order_group => {
            return Promise.all([
                Promise.resolve(recipe_order_group),
                recipe_order_group.getRecipeOrders()
            ]);
        }).then(orders_data => {
            let [recipe_order_group, recipe_orders] = orders_data;
            //broadcast approval to all recipe orders in group
            return Promise.all([
                Promise.resolve(recipe_order_group),
                Promise.all(recipe_orders.map(recipe_order => {
                    recipe_order.status = RECIPE_ORDER_STATUSES.Rejected;
                    return recipe_order.save();
                }))
            ]);
        });
    }

    //if the orders are being approved, each order in the group should be marked as "Executing"
    if (status == RECIPE_ORDER_GROUP_STATUSES.Approved) {
        let [err] = await to(RecipeOrder.update({
            status: RECIPE_ORDER_STATUSES.Executing
        }, {
            where: {
                recipe_order_group_id: recipe_order_group.id
            }
        }));

        if (err) TE(err);
    }

    let [err, results] = await to(update_group_promise);

    if (err) {
        TE(err);
    }

    return results;
};
module.exports.changeRecipeOrderGroupStatus = changeRecipeOrderGroupStatus;

const changeExecutionOrderStatus = async (execution_order_id, status) => {

    if (isNaN(execution_order_id)) TE(`Provided execution order id: "${execution_order_id}" is not valid`);
    if (!Object.values(EXECUTION_ORDER_STATUSES).includes(status)) TE(`Status "${status}" is not valid`);

    let [err, execution_order] = await to(ExecutionOrder.findById(execution_order_id));

    if (err) TE(err);
    if (!execution_order) return null;

    //Switch case for different situations
    switch (status) {
        case EXECUTION_ORDER_STATUSES.Pending: //User tries to reset the execution order.
            if (execution_order.status !== EXECUTION_ORDER_STATUSES.Failed) TE('Only Execution orders with the status Failed can be reinitiated');
            execution_order.failed_attemts = 0;
            break;

        default:
            TE(`You are not allowed to set the status of Execution order to "${status}"`);
            break;
    }


    const previous_values = execution_order.toJSON();

    execution_order.status = status;

    [err, execution_order] = await to(execution_order.save());

    if (err) TE(err);

    return {
        original_execution_order: previous_values,
        updated_execution_order: execution_order
    };

};
module.exports.changeExecutionOrderStatus = changeExecutionOrderStatus;