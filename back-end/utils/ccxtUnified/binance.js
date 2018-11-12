'use strict';

const InstrumentService = require('../../services/InstrumentsService');
const { Exchange } = require('./exchange');

class Binance extends Exchange {

  constructor (ccxt_con) {
    super("binance", ccxt_con);
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


    // get latest price
    let [err, ticker] = await to(this._connector.fetchTicker(external_instrument_id)); // add error handling later on
    if (err) TE(err.message);
    let price = side == 'buy' ? ticker.ask : ticker.bid;

    let quantity, adjusted_sell_quantity;
    [err, [quantity, adjusted_sell_quantity]] = await to(this.adjustQuantity(
      external_instrument_id,
      execution_order.spend_amount,
      price,
      execution_order.recipe_order_id
    ));
    if (err) TE(err.message);

    this.logOrder (this.api_id, external_instrument_id, order_type, side, quantity, price, adjusted_sell_quantity, execution_order.spend_amount, true)

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
   * Creates a standart withdraw. Manually fetch fees from the exchange
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

    const fees = await this._connector.fetchFundingFees();

    const withdraw_response = await this._connector.withdraw(asset_symbol, amount, address, tag, {});

    _.set(withdraw_response, 'info.fees', fees.withdraw[asset_symbol]);

    return withdraw_response;

  }

  /**
   * This one is the most straght forward, as we can dirrectly take withdraws. The only thing is done is that it checks from when to take and matches needed withdraw ids.
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

      return this._connector.fetchWithdrawals(request.asset, Date.parse(request.since) - 3000);

    }));

    const withdraws = _.filter(_.flatten(results), r => withdraw_ids.includes(r.id));

    return withdraws;    

  };

  /** Gets limits of specified symbol. Spend limit speficies how min/max amount we can spend.
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

    limits.spend = { 
      min: limits.amount.min * price.ask_price,
      max: limits.amount.max * price.ask_price
    };

    return limits;
  } 

  /**
   * This methods is same as the original for this exchange
   */
  async fetchFundingFees () {
    await this.isReady();
    
    return this._connector.fetchFundingFees();
  }

}

module.exports = Binance;