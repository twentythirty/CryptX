'use strict';

const InstrumentService = require('../../services/InstrumentsService');
const { Exchange } = require('./exchange');

class Kraken extends Exchange {

  constructor (ccxt_con) {
    super("kraken", ccxt_con);
  }

  /** This exchange takes amount of asset we want to buy to purchase that amount. Base asset will cost
   * will be calculated and deducted from balance. Order response returns amount of asset purchased, no
   * fee information.
   * 
   * @param {string} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
   * @param {string} side - word "buy" or "sell".
   * @param {object} order - whole execution order object.
   * @returns {promise} - Example result
   * {
   *   id: '123',
   *   timestamp: 1532934512538,
   *   datetime: '2018-07-30T07:08:32.538Z',
   *   lastTradeTimestamp: 1532934512538,
   *   status: 'closed',
   *   symbol: 'XRP/BTC',
   *   type: 'market',
   *   side: 'buy',
   *   price: undefined,
   *   amount: 1,
   *   cost: undefined,
   *   filled: 1,
   *   remaining: 0,
   *   fee: undefined
   * }
   */
  async createMarketOrder (external_instrument_id, side, execution_order) {
    await this.isReady();
    const order_type = "market";

    // get latest price
    let [err, ticker] = await to(this._connector.fetchTicker(external_instrument_id)); // add error handling later on
    
    if (err) TE(err.message);

    let quantity, adjusted_sell_quantity;
    [err, [quantity, adjusted_sell_quantity]] = await to(this.adjustQuantity(
      external_instrument_id,
      execution_order.spend_amount,
      ticker.ask,
      execution_order.recipe_order_id
    ));
    if (err) TE(err.message);

    console.log(`Creating market order to ${this.api_id}
    Instrument - ${external_instrument_id}
    Order type - ${order_type}
    Order side - ${side}
    Total quantity - ${quantity}
    Price - ${execution_order.price}`);

    let response;
    [err, response] = await to(this._connector.createOrder(
      external_instrument_id,
      order_type,
      side,
      quantity,
      0
    ));

    if (err) TE(err.message);

    let result = {
      external_identifier: response.id,
      placed_timestamp: response.timestamp - 1000,
      total_quantity: quantity,
      spend_amount: adjusted_sell_quantity
    };

    return [result, response];
  }


  /**
   * Gets limits of specified symbol. Spend limit speficies how min/max amount we can spend.
   * CCXT returns all minimum cost limits as 0.001 BTC, which is incorret. Binance allows to 
   * buy minimum amount of asset, which can be far lower than 0.001 BTC. The calculation of
   * spend limits for binance therefore is = min amount * price
   * @param {string} symbol - symbol to get limits for
   */
  async getSymbolLimits (symbol) {
    await this.isReady();
    let market = this._connector.markets[symbol];

    if (!market) TE(`Symbol ${symbol} not found in ${this.api_id}`);

    let limits = market.limits;
    
    let [err, price] = await to(InstrumentService.getPriceBySymbol(symbol, this.api_id));
    if (err) TE (err.message);
    if (!price) TE(`Couldn't find price for ${symbol}`);

    let max_amount = limits.amount.max || Infinity;

    limits.spend = { 
      min: limits.amount.min * price.ask_price,
      max: max_amount * price.ask_price
    };

    return limits;
  }

}

module.exports = Kraken;