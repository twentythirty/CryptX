const { ExecutionOrder, ExecutionOrderFill, Instrument, InstrumentMarketData } = require('../../../../models');

async function fetchOrder(external_id, symbol, params = {}) {

    /**
     * Some exchanges require you to pass the instrument symbol.
     * Not sure what's the purpose, but it should throw an error in case it is not valid, just like the actual exchange.
     */
    if(!this.markets[symbol] && !params.ignore_symbol) TE(`Error: ${this.name} does not support instrument "${symbol}" when fetching orders`);

    const order = this._orders.find(order => order.id === external_id);

    if(!order) return null;

    /**
     * Sometimes they match the symbol to the order. Not sure why again.
     */
    if(order.symbol !== symbol && !params.ignore_symbol) TE(`Error: passed symbol ${symbol} does not match the order with id "${order.id}" instrument symbol`);
    
    return order;

};
module.exports.fetchOrder = fetchOrder;
module.exports.fetch_order = fetchOrder;

async function fetchOrders(symbol, since) {

    since = new Date(since).getTime(); //Convert this to a timestamp just in case;

    if(!this.markets[symbol]) TE(`Error: ${this.name} does not support instrument "${symbol}" when fetching orders`);

    const found_orders = this._orders.filter(order => order.timestamp >= since);

    return found_orders;

};
module.exports.fetchOrders = fetchOrders;
module.exports.fetch_orders = fetchOrders;

async function loadMarkets() {
    return Promise.resolve()
}
module.exports.loadMarkets = loadMarkets;
module.exports.load_markets = loadMarkets;

async function fetchMyTrades(symbol, since) {

    since = new Date(since).getTime(); //Convert this to a timestamp just in case;

    if(!this.markets[symbol]) TE(`Error: ${this.name} does not support instrument "${symbol}" when fetching orders`);

    const found_trades = this._trades.filter(trade => trade.timestamp >= since);

    return found_trades;

}

module.exports.fetchMyTrades = fetchMyTrades;
module.exports.fetch_my_trades = fetchMyTrades;

/**
 * Method will mimmick the creation of orders on exchanges,
 * it will attempt to do some of the validation.
 * As well as that, some things (like presents of fees) will be randomized, in order to test
 * the adaptability of the system
 */
async function createMarketOrder(instrument, side, order) {

    if(!['buy', 'sell'].includes(side)) TE(`Error: "${side}" is not a valid order side!`);

    const exchange_instrument = this.markets[instrument];

    if(!exchange_instrument) TE(`Error: instrument "${instrument}" is not available on ${this.name}`);

    const amount_limits = _.get(exchange_instrument, 'limits.amount')
    if(!_.isEmpty(amount_limits) && !_.inRange(order.total_quantity, amount_limits.min, amount_limits.max)) TE(`Error: the order quantity is not within the limits: ${amount_limits.min} - ${amount_limits.max}`);

    const instrument_prices = await InstrumentMarketData.findOne({
        where: { instrument_id: order.instrument_id, exchange_id: order.exchange_id },
        order: [ [ 'timestamp', 'DESC' ] ]
    });

    const new_order = {
        id: String(this._current_order_id++),
        datetime: new Date(),
        timestamp: Date.now(),
        lastTradeTimestamp: null,
        status: 'open',
        symbol: instrument,
        type: 'market',
        side: side,
        price: side === 'buy' ? parseFloat(instrument_prices.ask_price) : parseFloat(instrument_prices.bid_price),
        amount: parseFloat(order.total_quantity),
        filled: 0,
        remaining: parseFloat(order.total_quantity),
        cost: 0,
        fee: {
            cost: 0,
            currency: side === 'buy' ? instrument.split('/')[1] : instrument.split('/')[0]
        },
        info: {}
    };

    this._orders.push(new_order);

    return new_order;

};

module.exports.createMarketOrder = createMarketOrder;
module.exports.create_market_order = createMarketOrder;

/**
 * Clears orders from memory if the scenario desires so.
 * @param {Number[]} [ids=[]] Optional array of ids. If nothing is passed, removes all orders and trades. 
 */
function purgeOrders(ids = []) {

    ids = ids.map(id => Number(id));

    if(ids.length) {
        this._orders = this._orders.filter(order => !ids.includes(order.id));
        this._trades = this._trades.filter(trade => !ids.includes(trade.order));
    }
    else {
        this._orders = [];
        this._trades = [];
    }

}
module.exports.purgeOrders = purgeOrders;

/**
 * Simulates trading in the exchange based on given options.
 * @param {Object} options Options for the simulation.
 * @param {Number} [options.rate=0] Rate at which the orders are simulated. The higher the number, the slower the eneration will be. By default, rate is 0 and will require 1 cycle to fill the orders.
 * @param {Number} [options.chance_of_new_trade=100] Base chance of the order having a new trade. Default: 100%
 * @param {Number} [options.multiple_trade_chance=0] Chance that more than one trade will be created if the order does not get filled. The chance only affects trades after the minimum amount was created.
 * @param {Number} [options.minimum_amount_of_trades=1] Minimum amount of trades to generate.
 * @param {Boolean} [options.force_to_close=false] Set to `true` to force close the orders that were not filled.
 */
function simulateTrades(options = {}) {

    const rate = options.rate || 0;
    const chance_of_new_trade = options.chance_of_new_trade || 100;
    const multiple_trade_chance = _.clamp(options.multiple_trade_chance || 0, 0, 100);
    const minimum_amount_of_trades = options.minimum_amount_of_trades || 1;
    const force_to_close = options.force_to_close || false;

    const active_orders = this._orders.filter(order => order.status === 'open');

    for(let order of active_orders) {

        if(force_to_close) {
            order.status = 'closed';
            //continue;
        }

        let dice_roll;
        let generated_trades = 0;
        let tolerance = 0;  //Safety tolerance, because while loops are SCARY.
        while(tolerance < 50) {
            tolerance++;

            dice_roll = _.random(1, 100, false);
            if(chance_of_new_trade <= dice_roll) break;

            const new_price_and_amount = _calculateNextFill(order.filled, order.amount, order.price, rate);
            
            const new_fee = (new_price_and_amount.price * new_price_and_amount.amount) / _.random(98, 100); //Fee will be 1-3% of the trade for now;

            const [ base_curreny, quote_currency ] = order.symbol.split('/');
            const new_trade = _.assign(new_price_and_amount, {
                id: String(this._current_trade_id++),
                datetime: new Date(),
                timestamp: Date.now(),
                symbol: order.symbol,
                order: order.id,
                type: order.type,
                side: order.side,
                cost : new_price_and_amount.price * new_price_and_amount.amount + new_fee,
                fee: {
                    cost: new_fee,
                    currency: order.side === 'buy' ? base_curreny : quote_currency
                },
                info: {}
            });
            this._trades.push(new_trade);
            generated_trades++;

            order.filled += new_price_and_amount.amount;
            order.remaining = order.amount - order.filled;
            order.lastTradeTimestamp = new_trade.timestamp;
            order.fee.cost += new_fee;

            if(order.filled == order.amount) {
                order.status = 'closed';
                break;
            }

            dice_roll = _.random(1, 100, false);

            if(multiple_trade_chance < dice_roll && generated_trades >= minimum_amount_of_trades) break;

        }

    }

}
module.exports.simulateTrades = simulateTrades;

const _calculateNextFill = (current_fill_amount, amount_to_reach, market_price, rate) => {

    const next_price = market_price + _.round(_.random(0.00001, 0.0001, true), 5);
    let next_fuzzy_rate = _.random(rate / 2, rate * 2, true);
    if(rate === 0) next_fuzzy_rate = 1;
    const next_amount = _.clamp((amount_to_reach / next_fuzzy_rate), (amount_to_reach - current_fill_amount));

    return {
        price: next_price,
        amount: next_amount
    };

};

async function fetchTicker(symbol) {

    if(!this._tickers) this._createTickers();

    return this._tickers[symbol] || null;
}
module.exports.fetchTicker = fetchTicker;
module.exports.fetch_ticker = fetchTicker;

async function fetchTickers(limit) {

    if(!this._tickers) this._createTickers();
    
    return this._tickers;
};
module.exports.fetchTickers = fetchTickers;
module.exports.fetch_tickers = fetchTickers;

const _createTickers = function() {

    const instruments = _.uniq(Object.keys(this.markets));
    const base_chance = 95;

    this._tickers = {};
    this._order_book = {};

    for(let instrument of instruments) {

        const is_missing_values = _.random(0, 100, false) > base_chance ? true : false;
        const price = _.random(1, 1000, true);
        const volume = _.random(0, 100000000);


        this._tickers[instrument] = {
            symbol: instrument,
            timestamp: Date.now(),
            datetime: new Date(),
            baseVolume: is_missing_values ? null : volume,
            ask: is_missing_values ? null : getFuzzy(price),
            bid: is_missing_values ? null : getFuzzy(price)
        };

        const asks = [];
        const bids = [];
        if(!is_missing_values) {
            for(let i = 0; i < _.random(1, 3, false); i++) {
                asks.push([getFuzzy(price), getFuzzy(volume)]);
                bids.push([getFuzzy(price), getFuzzy(volume)]);
            }
        }

        this._order_book[instrument] = {
            timestanp: Date.now(),
            datetime: new Date(),
            asks, bids
        };

    }

};
module.exports._createTickers = _createTickers;

async function fetchOrderBook(symbol) {

    if(!this._order_book) this._createTickers();

    return this._order_book[symbol] || null;

}
module.exports.fetchOrderBook = fetchOrderBook;
module.exports.fetch_order_book = fetchOrderBook;

function _init() {

    this._current_order_id = 1;
    this._current_trade_id = 1;

    this._orders = [];
    this._trades = [];

}

module.exports._init = _init;

const getFuzzy = number => {

    const fuzzyness = number / 1000;

    return (number + _.random(-fuzzyness, fuzzyness, true));

};