
const ccxtUtils = require('../CCXTUtils');

class Bitfinex {

  constructor () {
    this.api_id = "bitfinex";
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
   *   timestamp: 1532438296096,
   *   datetime: '2018-07-24T13:18:16.096Z',
   *   lastTradeTimestamp: undefined,
   *   symbol: 'XRP/BTC',
   *   type: 'market',
   *   side: 'buy',
   *   price: 0.00005609,
   *   average: 0,
   *   amount: 22,
   *   remaining: 22,
   *   filled: 0,
   *   status: 'open',
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
    

    return this._connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
  }

  /**
   * Creates a standart withdraw
   * @param {String} asset_symbol Asset to withdraw, example: BTC
   * @param {String|Number} amount Amount to withdraw
   * @param {Object} cold_storage_account Cold storage account object to send the funds to.
   * @returns {Promise}
   */
  async withdraw(asset_symbol, amount, address, tag) {
    await this.isReady();

    console.log(`
      Creating withdraw to ${this.api_id},
      Asset: ${asset_symbol},
      Amount: ${amount},
      Destination address: ${address}
    `);

    return this._connector.withdraw(asset_symbol, amount, address, tag, {});

  }

  /**
   * Simillar to Binance, but this time we wtch both deposit and withdraws and filter out only withdraws.
   * @param {[Object]} transfers Array of cold storage transfers with `asset` field containing the coin symbol
   */
  async fetchWithdraws (transfers) {
    await this.isReady();

    const transfers_by_asset = _.groupBy(transfers, 'asset');
    const withdraw_ids = _.map(transfers, t => t.external_identifier);

    //Create seperate requests for each asset and pick the oldest transfer as the starting point
    const requests = _.map(transfers_by_asset, (asset_transfers, asset) => {

      return {
        asset,
        since: _.get(_.minBy(transfers, 'placed_timestamp'), 'placed_timestamp', null)
      }

    });

    const results = await Promise.all(_.map(requests, request => {

      return this._connector.fetchTransactions(request.asset, request.since);

    }));

    const withdraws = _.filter(_.flatten(results), r => withdraw_ids.includes(r.id) && r.type === 'withdrawal');

    return withdraws;    

  };

}

module.exports = Bitfinex;