
const ccxtUtils = require('../CCXTUtils');

class Huobipro {

  constructor () {
    this.api_id = "huobipro"; 
    this.ready = this._connector = ccxtUtils.getConnector(this.api_id);
  }

  isReady () {
    return this.ready;
  }
  /** This exchange uses cost(amount we want to spend) instead of amount to buy cryptocurrency. Cost will be deducted from
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
  async createMarketOrder (external_instrument_id, side, execution_order) {
    await this.isReady();

    const order_type = "market";
  
    console.log(`Creating market order to ${this.api_id}
    Instrument - ${external_instrument_id}
    Order type - ${order_type}
    Order side - ${side}
    Total quantity - ${execution_order.total_quantity}
    Price - ${execution_order.price}`);
    
    return false;//this._connector.createOrder(external_instrument_id, order_type, side, order.total_quantity, order.price);
  }
}

module.exports = Huobipro;