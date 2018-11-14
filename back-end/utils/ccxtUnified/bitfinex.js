'use strict';

const InstrumentService = require('../../services/InstrumentsService');
const { Exchange } = require('./exchange');

class Bitfinex extends Exchange {

  constructor (ccxt_con) {
    super("bitfinex", ccxt_con);
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

    // get lates price
    let [err, ticker] = await to(this._connector.fetchTicker(external_instrument_id)); // add error handling later on

    if (err) TE(err.message);
    let price = side == 'buy' ? ticker.ask : ticker.bid;
    
    let quantity, adjusted_sell_quantity;
    [err, [quantity, adjusted_sell_quantity]] = await to(this.adjustQuantity(
      external_instrument_id,
      execution_order.spend_amount,
      price,
      execution_order
    ));
    if (err) TE(err.message);

    await this.logOrder (execution_order.id, this.api_id, external_instrument_id, order_type, side, quantity, price, adjusted_sell_quantity, execution_order.spend_amount, true)

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
   * Creates a standart withdraw
   * @param {String} asset_symbol Asset to withdraw, example: BTC
   * @param {String|Number} amount Amount to withdraw
   * @param {Object} cold_storage_account Cold storage account object to send the funds to.
   * @returns {Promise}
   */
  async withdraw(transfer) {
    await this.isReady();

    let { asset_symbol, amount, address, tag, fee } = transfer.getWithdrawParams();

    amount = Decimal(amount).minus(fee).toString(); //Deduct the fee 

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

      return this._connector.fetchTransactions(request.asset, Date.parse(request.since) - 3000); //Minusing in case the timestamps are off by a little

    }));

    const withdraws = _.filter(_.flatten(results), r => withdraw_ids.includes(r.id) && r.type === 'withdrawal');

    return withdraws;    

  };

  /** Gets of specified symbol
   * @param {string} symbol 
   */
  async getSymbolLimits (symbol) {
    await this.isReady();
    let market = this._connector.markets[symbol];

    if (!market) TE(`Symbol ${symbol} not found in ${this.api_id}`);
    let limits = market.limits;
    
    limits.spend = {
      min: limits.cost.min,
      max: !_.isUndefined(limits.cost.max) ? limits.cost.max : Infinity
    };

    return limits;
  }

}

module.exports = Bitfinex;