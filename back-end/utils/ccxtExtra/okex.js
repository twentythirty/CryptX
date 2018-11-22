const querystring = require('querystring');
const Bottleneck = require('bottleneck');
const bottleneck = new Bottleneck({
    id: `OKEXv3`,
    minTime: 180, //Around 6 requests per second
    maxConcurrent: 1
});

module.exports = {
    has: {
        fetchMyTrades: true,
        fetchFundingFees: true
    },

    async fetchMyTrades(symbol, since, limit = undefined, params = {}) {

        const request = {
            order_id: params.order_id,
            instrument_id: symbol.replace('/', '-'),
            limit: limit || 100
        };

        const trades = await this.createV3Request('get', '/api/spot/v3/fills', request);

        if (!_.isArray(trades)) return [];

        return trades.map(trade => {
            return {
                info: trade,
                id: trade.ledger_id,
                datetime: trade.timestamp,
                timestamp: Date.parse(trade.timestamp),
                order: String(trade.order_id),
                symbol: trade.instrument_id.replace('-', '/'),
                type: undefined,
                takerOrMaker: trade.exec_type === 'T' ? 'taker' : 'maker',
                side: trade.side,
                price: parseFloat(trade.price),
                amount: parseFloat(trade.size),
                fee: {
                    cost: parseFloat(trade.fee),
                    currency: trade.instrument_id.split('-')[0]
                }
            };
        });

    },

    async withdraw(currency, amount, address, tag = undefined, options = {}) {

        const request = {
            currency,
            amount: parseFloat(amount),
            destination: 4,
            to_address: address,
            trade_pwd: this.password,
            fee: options.chargefee
        };

        const withdraw_result = await this.createV3Request('post', '/api/account/v3/withdrawal', request);

        return {
            info: _.assign(withdraw_result, { fees: options.chargefee }),
            id: withdraw_result.withdrawal_id
        };

    },

    async fetchFundingFees() {

        const response = await this.createV3Request('get', '/api/account/v3/withdrawal/fee');

        let withdraw = {};
        for (let coin of response) {
            withdraw[coin.currency] = coin.min_fee || 0;
        }

        return {
            info: response,
            deposits: {},
            withdraw: withdraw
        }
    },

    /**
     * Current CCXT implementation only return the spot (trading) balance.
     * @param {Object} [params={}] 
     */
    async fetchBalance(params = {}) {

        const type = params.type || 'wallet';
        const type_path_map = {
            'wallet': '/api/account/v3/wallet',
            'spot': '/api/spot/v3/accounts',
            'trading': '/api/spot/v3/accounts'
        };

        const result = await this.createV3Request('get', type_path_map[type]);

        const balance = {
            free: {}, total: {}, used: {} 
        };

        for(let bal of result) {
            balance.free[bal.currency] = parseFloat(bal.available);
            balance.total[bal.currency] = parseFloat(bal.balance);
            balance.used[bal.currency] = parseFloat(bal.hold);
            balance[bal.currency] = {
                free: parseFloat(bal.available),
                total: parseFloat(bal.balance),
                used: parseFloat(bal.hold)
            };
        }

        return balance;

    },

    async transferFunds(currency, from, to, amount, params = {}) {

        const account_map = {
            'wallet': 6,
            'spot': 1,
            'trading': 1
        };

        const request = {
            currency,
            amount: parseFloat(amount),
            from: account_map[from],
            to: account_map[to]
        };

        return this.createV3Request('post', '/api/account/v3/transfer', request);

    },

    signv3(timestamp, method, request_path, body = {}) {

        if (_.isEmpty(body)) body = '';
        else if (method.toLowerCase() === 'get') body = '?' + querystring.stringify(body);
        else body = JSON.stringify(body);

        let message = String(timestamp) + String(method).toUpperCase() + request_path + body;
        let hash = require('crypto').createHmac('sha256', this.v3_api_secret).update(new Buffer(message)).digest('base64');
        return hash;

    },

    async createV3Request(method = 'get', request_path, body = {}) {
        const now = new Date().toISOString();

        return bottleneck.schedule(() => {
            return require('request-promise')[method]({
                uri: 'https://www.okex.com' + request_path + (!_.isEmpty(body) && method === 'get' ? `?${querystring.stringify(body)}` : ''),
                headers: {
                    'OK-ACCESS-KEY': this.v3_api_key,
                    'OK-ACCESS-SIGN': this.signv3(now, method, request_path, body),
                    'OK-ACCESS-TIMESTAMP': now,
                    'OK-ACCESS-PASSPHRASE': this.v3_api_passphrase
                },
                json: true,
                agent: this.agent,
                body: !_.isEmpty(body) && method.toLowerCase() !== 'get' ? body : undefined
            });
        });

    }
};