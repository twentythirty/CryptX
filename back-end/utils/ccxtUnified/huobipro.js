'use strict';

const InstrumentService = require('../../services/InstrumentsService');
const { Exchange } = require('./exchange');

class Huobipro extends Exchange {

  constructor (ccxt_con) {
    super("huobipro", ccxt_con);
  }
  /** This exchange uses cost(amount we want to spend) instead of amount to buy cryptocurrency,
   * supplied via ccxt createOrder methods 'price' property. Cost will be deducted from
   * base asset and amount of asset we get will be calculated by exchange.
   * 
   * @param {string} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
   * @param {string} side - word "buy" or "sell".
   * @param {object} order - whole execution order object.
   * @returns {promise} - Example result
   * {
   *   id: '123',
   *   timestamp: 1532435312978,
   *   datetime: '2018-07-24T12:28:32.978Z',
   *   lastTradeTimestamp: undefined,
   *   status: undefined,
   *   symbol: 'XRP/BTC',
   *   type: 'market',
   *   side: 'buy',
   *   price: 0.0001,
   *   amount: 1,
   *   filled: undefined,
   *   remaining: undefined,
   *   cost: undefined,
   *   trades: undefined,
   *   fee: undefined
   * }
   */
  async createMarketOrder (external_instrument_id, side, execution_order, fail) {
    await this.isReady();
    const order_type = "market";

    if (fail) TE("Simulated fail");
    
    // get latest price
    let [err, ticker] = await to(this._connector.fetchTicker(external_instrument_id)); // add error handling later on
    
    if (err) TE(err.message);
    let price = side == 'buy' ? ticker.ask : ticker.bid;

    let quantity = Decimal(execution_order.spend_amount).div(Decimal(price)).toString();

    await this.logOrder ({
      execution_order_id: execution_order.id,
      api_id: this.api_id,
      external_instrument_id: external_instrument_id,
      order_type: order_type,
      side: side,
      quantity: quantity,
      price: price,
      sold_quantity: execution_order.spend_amount,
      sell_qnt_unajusted: execution_order.spend_amount,
      accepts_transaction_quantity: false
    });

    let response;
    [err, response] = await to(this._connector.createOrder(
      external_instrument_id,
      order_type,
      side,
      execution_order.total_quantity,
      execution_order.spend_amount // huobi takes amount to buy in price field
    ));

    if (err) TE(err.message);

    let result = {
      external_identifier: response.id,
      placed_timestamp: response.timestamp - 1000,
      total_quantity: quantity
    };

    return [result, response];

  }


  async getSymbolLimits (symbol) {
    await this.isReady();
    let market = this._connector.markets[symbol];

    if (!market) TE(`Symbol ${symbol} not found in ${this.api_id}`);

    let limits = market.limits;
    
    let [err, price] = await to(InstrumentService.getPriceBySymbol(symbol, this.api_id));
    if (err) TE (err.message);
    if (!price) TE(`Couldn't find price for ${symbol}`);

    let max_amount = limits.amount.max || Number.MAX_VALUE;

    limits.spend = {
      min: limits.amount.min * price.ask_price,
      max: max_amount * price.ask_price
    };

    return limits;
  }
}

module.exports = Huobipro;