'use strict';

const InstrumentService = require('../../services/InstrumentsService');
const { Exchange } = require('./exchange');
class Okex extends Exchange {

  constructor (ccxt_con) {
    super("okex", ccxt_con);
  }

  /** This exchange uses cost(amount we want to spend) instead of amount to buy cryptocurrency,
   * supplied via additional params with 'cost' property. Cost will be deducted from
   * base asset and amount of asset we get will be calculated by exchange.
   * 
   * @param {*} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
   * @param {*} side - word "buy" or "sell".
   * @param {*} order - whole execution order object.
   * @returns {promise} - Example result
   * {
   *   id: '123',
   *   timestamp: 1532938747205,
   *   datetime: '2018-07-30T08:19:07.205Z',
   *   lastTradeTimestamp: undefined,
   *   status: undefined,
   *   symbol: 'XRP/BTC',
   *   type: 'market',
   *   side: 'buy',
   *   price: 0.00001,
   *   amount: 2.123456798,
   *   filled: undefined,
   *   remaining: undefined,
   *   cost: undefined,
   *   trades: undefined,
   *   fee: undefined
   * }
   */
  async createMarketOrder (external_instrument_id, side, execution_order) {
    await this.isReady();
    const order_type = "market";

    // get latest price
    let [err, ticker] = await to(this._connector.fetchTicker(external_instrument_id)); // add error handling later on
    
    if (err) TE(err.message);
    let quantity = execution_order.spend_amount / ( side == 'buy' ? ticker.ask : ticker.bid );

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
      0,
      { cost: execution_order.spend_amount } // okex takes additional parameter cost
    ));

    if (err) TE(err.message);

    let result = {
      external_identifier: response.id,
      placed_timestamp: response.timestamp - 1000,
      total_quantity: quantity
    };

    return [result, response];

  }

  /**
   * Creates a withdraw. OKEx requires to specify the blockchain fee and also a trade/admin password.
   * @param {String} asset_symbol Asset to withdraw, example: BTC
   * @param {String|Number} amount Amount to withdraw
   * @param {Object} cold_storage_account Cold storage account object to send the funds to.
   * @returns {Promise}
   */
  async withdraw(asset_symbol, amount, address, tag) {
    await this.isReady();

    const fee_map = {
      BTC: 0.002,
      LTC: 0.001,
      ETH: 0.01,
      ETC: 0.001,
      BCH: 0.0005
    };

    const chargefee = fee_map[asset_symbol];

    console.log(`
      Creating withdraw to ${this.api_id},
      Asset: ${asset_symbol},
      Amount: ${amount},
      Blockchain Fee: ${chargefee},
      Destination address: ${address}
    `);

    return this._connector.withdraw(asset_symbol, amount, address, tag, { 
      chargefee,
      password: '???' //Currently unknown how this will be handled
    });

  }

  /**
   * Gets limits of specified symbol. 
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

module.exports = Okex;