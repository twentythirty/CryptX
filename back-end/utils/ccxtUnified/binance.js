
const ccxtUtils = require('../CCXTUtils');

class Binance {

  constructor () {
    this.api_id = "binance"; 
    this.ready = ccxtUtils.getConnector(this.api_id).then(con => {
      this._connector = con;
    });
  }

  isReady () {
    return this.ready;
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
 *   timestamp: 1532444115700,
 *   datetime: '2018-07-24T14:55:15.700Z',
 *   lastTradeTimestamp: undefined,
 *   symbol: 'XRP/BTC',
 *   type: 'market',
 *   side: 'buy',
 *   price: 0,
 *   amount: 1,
 *   cost: 0,
 *   filled: 1,
 *   remaining: 0,
 *   status: 'closed',
 *   fee: undefined,
 *   trades: undefined
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
    

    return this._connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
  }
}

module.exports = Binance;