
const ccxtUtils = require('../CCXTUtils');

class Okex {

  constructor () {
    this.api_id = "okex"; 
    this.ready = ccxtUtils.getConnector(this.api_id).then(con => {
      this._connector = con;
    });
  }

  isReady () {
    return this.ready;
  }
  /** This exchange uses cost(amount we want to spend) instead of amount to buy cryptocurrency. Cost will be deducted from
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
  
    console.log(`Creating market order to ${this.api_id}
    Instrument - ${external_instrument_id}
    Order type - ${order_type}
    Order side - ${side}
    Total quantity - ${execution_order.total_quantity}
    Price - ${execution_order.price}`);
  
    return false; //this._connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
  }

  /**
   * Creates a withdraw. OKEx requires to specify the blockchain fee and also a trade/admin password.
   * @param {String} asset_symbol Asset to withdraw, example: BTC
   * @param {String|Number} amount Amount to withdraw
   * @param {Object} cold_storage_account Cold storage account object to send the funds to.
   * @returns {Promise}
   */
  async withdraw(asset_symbol, amount, cold_storage_account) {
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
      Destination address: ${cold_storage_account.address}
    `);

    return this._connector.withdraw(asset_symbol, amount, cold_storage_account.address, cold_storage_account.tag, { 
      chargefee,
      password: '???' //Currently unknown how this will be handled
    });

  }

}

module.exports = Okex;