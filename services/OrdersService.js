'use strict';


const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const InvestmentRunDeposit = require('../models').InvestmentRunDeposit;
const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeOrder = require('../models').RecipeOrder;
const instrument = require('../models').Instrument;
const InstrumentExchangeMapping = require('../models').InstrumentExchangeMapping;
const InstrumentMarketData = require('../models').InstrumentMarketData;


const sameAssets = (obj1, obj2) => {

    return (
        (obj1.transaction_asset_id == obj2.transaction_asset_id &&
            obj1.quote_asset_id == obj2.quote_asset_id) ||
        (obj1.quote_asset_id == obj2.transaction_asset_id &&
            obj1.transaction_asset_id == obj2.quote_asset_id)
    )
}

const marketDataKeyForRunDetail = (market_data_keys, recipe_run_detail) => {

    return _.find(market_data_keys, key => {
        const [key_instrument, key_exchange_id] = key;
        return (
            key_exchange_id == recipe_run_detail.exchange_id &&
            sameAssets(key_instrument, recipe_run_detail)
        )
    });
}

const generateApproveRecipeOrders = async (recipe_run_id) => {

    const recipe_run = await RecipeRun.findById(recipe_run_id);

    //fetch all individual recipe run details
    const recipe_run_details = await RecipeRunDetail.findAll({
        where: {
            recipe_run_id: recipe_run_id
        }
    });
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

    //get latest ask/bid for those pairs (first element in group is latest)
    //grouped into {
    // [instrument, exchange_id]: [{market_data}, {market_data}...], 
    // [instrument, exchange_id]: [{market_data}, {market_data}...], 
    // ...
    //}
    const grouped_market_data = _.groupBy(await InstrumentMarketData.findAll({
        where: {
            instrument_id: Object.keys(grouped_exchanges),
            exchange_id: _.flatMap(_.map(Object.values(grouped_exchanges), 'exchange_id'))
        },
        order: [
            ['timestamp', 'DESC']
        ]
    }), market_data => [instruments_by_id[market_data.instrument_id], market_data.exchange_id]);

    //investment run deposits, mapped by currency deposit was made in
    const investment_deposits = _.keyBy(await InvestmentRunDeposit.findAll({
        where: {
            investment_run_id: recipe_run.investment_run_id
        }
    }), 'asset_id');

    //filter out recipe run detailes where we dont have the info
    const market_data_keys = Object.keys(grouped_market_data);
    const valid_recipe_run_details = _.filter(recipe_run_details, recipe_run_detail => {
        //is there market data 
        //for assets of recipe on exchange of recipe
        const market_data = marketDataKeyForRunDetail(market_data_keys, recipe_run_detail);
        //is there a deposit in the currency we wish to sell
        const deposit = investment_deposits[recipe_run_detail.transaction_asset_id];

        //if either is missing, this is a bad recipe detail and will be ignored
        if (market_data && deposit) {
            return true;
        } else {
            console.log(`
            WARN: Skipping recipe run detail due to missing info! 
            Recipe run detail id: ${recipe_run_detail.id}
            Detail exchange id: ${recipe_run_detail.exchange_id}
            Detail proposed trade: ${recipe_run_detail.transaction_asset_id}->${recipe_run_detail.quote_asset_id}
            Detail percentage: ${recipe_run_detail.investment_percentage}\n`);
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
        approval_user_id: recipe_run.approval_user_id,
        recipe_run_id: recipe_run_id
    }));
    if (err || !orders_group) TE(`error creating orders group: ${err}`, err);

    let results = [];
    //create saving futures for orders from recipe run details
    [err, results] = await to(Promise.all(_.map(valid_recipe_run_details, recipe_run_detail => {

        const market_data_key = marketDataKeyForRunDetail(market_data_keys, recipe_run_detail);
        //if the market data and recipe run detail use the same base currency
        //then we use the bid price and make a buy order
        const buy_order = recipe_run_detail.transaction_asset_id == market_data_key[0].transaction_asset_id;
        //get correct price/order side
        const price = (buy_order ? market_data.bid_price : market_data.ask_price);
        const side = buy_order ? ORDER_SIDES.Buy : ORDER_SIDES.Sell;

        const market_data = grouped_market_data[market_data_key][0];
        //get deposit in base currency
        const deposit = investment_deposits[recipe_run_detail.transaction_asset_id];
        //total amount to spend on this currency
        const spend_amount = recipe_run_detail.investment_percentage * deposit.amount;
        //amount of currency to buy
        const qnty = spend_amount / price;

        return RecipeOrder.create({
            recipe_order_group_id: orders_group.id,
            instrument_id: market_data.instrument_id,
            price: price,
            quantity: qnty,
            side: side,
            status: RECIPE_ORDER_STATUSES.Pending
        });
    })));

    if (err) TE(`Error saving new recipe orders based on recipe run details: ${err}`, err);

    return results;
}
module.exports.generateApproveRecipeOrders = generateApproveRecipeOrders;