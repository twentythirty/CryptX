const { ExecutionOrder, ExecutionOrderFill, Instrument, InstrumentMarketData, sequelize} = require('../../../../models');

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
async function createMarketOrder(instrument, side, amount, params) {

    if(!['buy', 'sell'].includes(side)) TE(`Error: "${side}" is not a valid order side!`);

    const exchange_instrument = this.markets[instrument];

    if(!exchange_instrument) TE(`Error: instrument "${instrument}" is not available on ${this.name}`);

    const amount_limits = _.get(exchange_instrument, 'limits.amount')
    if(!_.isEmpty(amount_limits) && !_.inRange(amount, amount_limits.min, amount_limits.max)) TE(`Error: the order quantity is not within the limits: ${amount_limits.min} - ${amount_limits.max}`);

    const instrument_prices = await sequelize.query(`
        SELECT imd.ask_price, imd.bid_price
        FROM instrument_exchange_mapping iem
        JOIN exchange e ON e.id=iem.exchange_id
        JOIN LATERAL (
            SELECT ask_price, bid_price
            FROM instrument_market_data imd
            WHERE instrument_id=iem.instrument_id
                AND exchange_id=e.id
            ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
            LIMIT 1
        ) as imd ON TRUE
        WHERE iem.external_instrument_id=:instrument
            AND e.api_id=:exchange
    `, {
        replacements: {
            instrument,
            exchange: this.id
        },
        plain: true,
        type: sequelize.QueryTypes.SELECT
    });/* InstrumentMarketData.findOne({
        where: { instrument_id: order.instrument_id, exchange_id: order.exchange_id },
        order: [ [ 'timestamp', 'DESC' ] ]
    }); */

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
        amount: parseFloat(amount),
        filled: 0,
        remaining: parseFloat(amount),
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

async function createOrder(instrument, order_type, side, amount, price, params) {
    
    if (order_type != 'market') TE('Order placement for other than market orders is not supported yet!');

    return await this.createMarketOrder(instrument, side, amount, params);
}
module.exports.createOrder = createOrder;

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

    await this._tickersCreated;

    if(!this._tickers)
        this._tickersCreated = this._createTickers();

    await this._tickersCreated;

    return this._tickers[symbol] || null;
}
module.exports.fetchTicker = fetchTicker;
module.exports.fetch_ticker = fetchTicker;

async function fetchTickers(limit) {

    await this._tickersCreated;

    if(!this._tickers)
        this._tickersCreated = this._createTickers();
    
    await this._tickersCreated;

    return this._tickers;
};
module.exports.fetchTickers = fetchTickers;
module.exports.fetch_tickers = fetchTickers;

const _createTickers = async function() {

    const instruments = _.uniq(Object.keys(this.markets));
    const base_chance = 95;

    this._tickers = {};
    this._order_book = {};


    let instrument_prices = await sequelize.query(`
        SELECT iem.external_instrument_id as symbol, imd.ask_price, imd.bid_price
        FROM instrument_exchange_mapping iem
        JOIN exchange e ON e.id=iem.exchange_id
        JOIN LATERAL (
            SELECT ask_price, bid_price
            FROM instrument_market_data imd
            WHERE instrument_id=iem.instrument_id
                AND exchange_id=e.id
            ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
            LIMIT 1
        ) as imd ON TRUE
        WHERE e.api_id=:exchange
            AND iem.external_instrument_id IN (:instruments)
    `, {
        replacements: {
            instruments: instruments,
            exchange: this.id
        },
        type: sequelize.QueryTypes.SELECT
    });

    for(let instrument of instruments) {

        let found = instrument_prices.find(i => i.symbol == instrument);
        const is_missing_values = false;// _.random(0, 100, false) > base_chance ? true : false;
        const price = found ?
            found.ask_price :
            ( /^(BTC|ETH)\//.test(instrument) ?
            _.random(300, 3000, true) : // price in hundreds/thousands if it's BTC/XXX or ETH/XXX asset.
            _.random(0.00001, 0.01, true) );
        const volume = _.random(0, 100000000);

        

        this._tickers[instrument] = {
            symbol: instrument,
            timestamp: Date.now(),
            datetime: new Date(),
            baseVolume: is_missing_values ? null : volume,
            ask: found ? found.ask_price : is_missing_values ? null : getFuzzy(price),
            bid: found ? found.bid_price : is_missing_values ? null : getFuzzy(price)
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

    return true;
};
module.exports._createTickers = _createTickers;

async function fetchOrderBook(symbol) {

    if(!this._order_book) this._createTickers();

    return this._order_book[symbol] || null;

}
module.exports.fetchOrderBook = fetchOrderBook;
module.exports.fetch_order_book = fetchOrderBook;

async function withdraw(symbol, amount, address, tag) {

    const symbols = _.map(this.markets, (data, instrument) => {
        return instrument.split('/')[0];
    });

    if(!symbols.includes(symbol)) TE(`Error: "${symbol}" does not exist on the exchange`);
    if(!amount || isNaN(amount)) TE('Error: ivalid withdraw amount');

    const withdrawal = {
        id: String(this._current_transaction_id++),
        info: {},
        txid: String(_.random(10, 100000)),
        timestamp: Date.now(),
        datetime: new Date(),
        address,
        tag,
        amount,
        currency: symbol,
        status: 'pending',
        updated: null,
        fee: {
            currency: symbol,
            cost: Decimal(amount).div(100).toString()
        }
    };

    const transaction = _.assign({ type: 'withdrawal' }, withdrawal);

    this._withdrawals.push(withdrawal);
    this._transactions.push(transaction);

    return {
        id: withdrawal.id,
        info: {}
    };

};
module.exports.withdraw = withdraw;

async function fetchWithdrawals(symbol, since) {

    return this._withdrawals.filter(w => w.currency === symbol && w.timestamp >= (_.isNumber(since) ? since : Date.parse(since)))

}
module.exports.fetchWithdrawals = fetchWithdrawals;
module.exports.fetch_withdrawals = fetchWithdrawals;

async function fetchTransactions(symbol, since) {

    return this._transactions.filter(t => t.currency === symbol && t.timestamp >= (_.isNumber(since) ? since : Date.parse(since)))

}
module.exports.fetchTransactions = fetchTransactions;
module.exports.fetch_transactions = fetchTransactions;

async function fetchBalance() {

    return this._balance

}
module.exports.fetchBalance = fetchBalance;
module.exports.fetch_balane = fetchBalance;

function _setBalance(balance) {

    _.map(balance, (amount, symbol) => {

        const free = parseFloat(amount);
        const used = 0;
        const total = free + used;

        this._balance[symbol] = { free, used, total };
        this._balance.free[symbol] = free;
        this._balance.used[symbol] = used;

    });
}
module.exports._setBalance = _setBalance;

async function fetchFundingFees() {

    return this._funding_fees;

}
module.exports.fetchFundingFees = fetchFundingFees;
module.exports.fetch_funding_fees = fetchFundingFees;

function _setWithdrawFees(fees, amount = undefined) {

    if(_.isString(fees)) this._funding_fees.withdraw[fees] = amount;
    
    else this._funding_fees.withdraw = fees;

}
module.exports._setWithdrawFees = _setWithdrawFees;

function _init() {

    this._current_order_id = 1;
    this._current_trade_id = 1;
    this._current_transaction_id =1;

    this._orders = [];
    this._trades = [];
    this._withdrawals = [];
    this._transactions = [];

    this._balance = {
        free: {},
        used: {}
    };
    this._funding_fees = {
        withdraw: {},
        deposits: {}
    }

}
module.exports._init = _init;

function _changeTransactionStatus(id, status) {

    const transaction = this._transactions.find(t => t.id === id);
    if(transaction) transaction.status = status;

    const withdrawal = this._withdrawals.find(w => w.id === id);
    if(withdrawal) withdrawal.status = status;

}
module.exports._changeTransactionStatus = _changeTransactionStatus;

const getFuzzy = number => {

    const fuzzyness = number / 1000;

    return (number + _.random(-fuzzyness, fuzzyness, true));

};