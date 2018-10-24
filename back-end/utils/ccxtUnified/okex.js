const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request-promise');
const BottleNeck = require('bottleneck');
const ccxtUtils = require('../CCXTUtils');

const limiter = new BottleNeck({
  maxConcurrent: 1,
  minTime: 100 //10 requests / 1 sec
});

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
      body: {
        ...body,
        sign
      },
      json: true
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

}

module.exports = Okex;
