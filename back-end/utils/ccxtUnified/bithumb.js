
const ccxtUtils = require('../CCXTUtils');
class Bithumb {

  constructor () {
    this.api_id = "bithumb"; 
    this.ready = ccxtUtils.getConnector(this.api_id).then(con => {
      this._connector = con;
    });
  }

  isReady () {
    return this.ready;
  }
  /** This exchange has not been tested yet...
   * 
   * @param {string} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
   * @param {string} side - word "buy" or "sell".
   * @param {object} order - whole execution order object.
   * @returns {promise} - Example result
   * {
   *   ???
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
    
    return 'order placed';//this._connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
  }
}

module.exports = Bithumb;