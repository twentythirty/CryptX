'use strict';

const InstrumentService = require('../../services/InstrumentsService');
const { Exchange } = require('./exchange');

const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request-promise');
const BottleNeck = require('bottleneck');
const ccxtUtils = require('../CCXTUtils');

const limiter = new BottleNeck({
  maxConcurrent: 1,
  minTime: 100 //10 requests / 1 sec
});

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
    let price = side == 'buy' ? ticker.ask : ticker.bid;

    let quantity = Decimal(execution_order.spend_amount).div(Decimal(price));

    this.logOrder (this.api_id, external_instrument_id, order_type, side, quantity, price, execution_order.spend_amount, execution_order.spend_amount, false)

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
  async withdraw(transfer) {
    await this.isReady();

    let { asset_symbol, amount, address, tag, fee } = transfer.getWithdrawParams();

    let chargefee = fee;
    if(!chargefee || parseFloat(chargefee) === 0) {
      const { withdraw } = await this._connector.fetchFundingFees();
      chargefee = withdraw[asset_symbol] || 0;
      transfer.fee = chargefee;
    }

    amount = Decimal(amount).minus(chargefee).toString(); //Deduct the fee 

    console.log(`
      Creating withdraw to ${this.api_id},
      Asset: ${asset_symbol},
      Amount: ${amount},
      Blockchain Fee: ${chargefee},
      Destination address: ${address}
    `);

    return this._connector.withdraw(asset_symbol, amount, address, tag, { 
      chargefee
    });

  }

  /**
   * CCXT does not support withdraw or transaction list fetching, we will have send a direct request to OKEX.
   * @param {[Object]} transfers Array of cold storage transfers with `asset` field containing the coin symbol
   */
  async fetchWithdraws (transfers) {
    await this.isReady();

    const results = await Promise.all(_.map(transfers, transfer => {
      //user records does not return any id, so we can't 100% match them with our records, for now we will fetch indidividual withdraws
      return limiter.schedule(() => {
        return this.createPostRequest('withdraw_info.do', {
          withdraw_id: transfer.external_identifier,
          symbol: `${transfer.asset.toLowerCase()}_usd`, //I don't even know...
        });
      }); 

    }));
    
    const errors = _.filter(results, result => !result.result && result.error_code);

    if(errors.length) TE(`ERROR: Exchange responsed with error codes: ${_.uniq(_.map(errors, e => e.error_code)).join(', ')}`);

    const withdraws = _.map(results, result => {

      const withdraw = result.withdraw[0];

      //Convert to CCXT format as muc as possible
      return {
        info: withdraw,
        id: String(withdraw.withdraw_id),
        timestamp: new Date(withdraw.created_date),
        address: withdraw.address,
        amount: withdraw.amount,
        fee: {
          cost: withdraw.chargefee
        },
        status: this.parseStatus(withdraw.status)
      };

    });

    return withdraws;    

  };

  sign (query) {

    const algorithm = 'md5';
  
    return crypto.createHash(algorithm).
      update(new Buffer(`${query}&secret_key=${this._connector.secret}`)).
      digest('hex').toString().toUpperCase();
  };
  
  createPostRequest(method, params) {
    
    const api_url = 'https://www.okex.com/api/v1/';

    const body = _.assign(params, {
      api_key: this._connector.apiKey,
    });

    const sign = this.sign(querystring.stringify(body).split('&').sort().join('&'));

    return request.post({
      uri: `${api_url}${method}`,
      form: {
        ...body,
        sign
      },
      json: true,
      agent: ccxtUtils.proxy_agent
    });

  };

  parseStatus(code) {

    const status_map = {
      '-3': 'failed',
      '-2': 'canceled',
      '-1': 'failed',
      '0': 'pending', // 0 and 1 are both shown as `pending` in the documentation, no idea what is the difference
      '1': 'pending',
      '2': 'ok',
      '3': 'pending',
      '4': 'pending',
      '5': 'pending'
    };

    return status_map[code];
  }

  /** Gets limits of specified symbol. 
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

  /**
   * For now, it will simply ensure that the destination account has the required amount
   * @param {*} transfer 
   * @param {*} params 
   */
  async transferFunds(transfer, params = {}) {

    const [ from_balance, to_balance ] = await Promise.all([
      this._connector.fetchBalance({ type: transfer.from }),
      this._connector.fetchBalance({ type: transfer.to })
    ]);

    return Promise.all(transfer.currencies.map(currency => {

      const from_amount = _.get(from_balance, `free.${currency.currency}`, 0);
      const to_amount =  _.get(to_balance, `free.${currency.currency}`, 0);

      const required_amount = parseFloat(currency.amount);

      if(to_amount >= required_amount) return;
      
      const funds_to_send = _.clamp(required_amount - to_amount, from_amount); //In case the source account is smaller
      if(funds_to_send === 0) {
        console.warn(`\x1b[1m\x1b[31mWARNING:\x1b[0m Source balance "${transfer.from}" has 0 ${currency.currency}!!!`);
        return;
      }

      return this._connector.transferFunds(currency.currency, transfer.from, transfer.to, funds_to_send);

    }));

  }

  signv3(timestamp, method, request_path, body = {}) {

    if(_.isEmpty(body)) body = '';

    let message = String(timestamp) + String(method).toUpperCase() + request_path + body;
    let hash = require('crypto').createHmac('sha256', this._connector.v3_api_secret).update(new Buffer(message)).digest('base64');

    return hash;

  }

  async createV3Request(method = 'get', request_path, body = {}) {
    const now = new Date().toISOString();

    return require('request-promise')[method]({
      uri: 'https://www.okex.com' + request_path,
      headers: {
        'OK-ACCESS-KEY': this._connector.v3_api_key,
        'OK-ACCESS-SIGN': this.signv3(now, 'GET', request_path, body),
        'OK-ACCESS-TIMESTAMP': now,
        'OK-ACCESS-PASSPHRASE': this._connector.v3_api_passphrase
      },
      json: true,
      agent: require('../CCXTUtils').proxy_agent
    });
  }

}

module.exports = Okex;
