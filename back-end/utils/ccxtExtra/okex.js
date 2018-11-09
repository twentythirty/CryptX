const querystring = require('querystring');
const Bottleneck = require('bottleneck');
const bottleneck = new Bottleneck({
    id: `OKEXv3`,
    minTime: 180, //Around 6 requests per second
    maxConcurrent: 1
});

module.exports = {
    has: {
        fetchMyTrades: true
    },

    async fetchMyTrades(symbol, since, params = {}) {

        const request = {
            order_id: params.order_id,
            instrument_id: symbol.replace('/', '-'),
            limit: params.limit || 100
        };

        const trades = await this.createV3Request('get', '/api/spot/v3/fills', request);

        if(!_.isArray(trades)) return [];

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
                    currency: trade.instrument_id.split('-')[1]
                }
            };
        });

    },

    signv3(timestamp, method, request_path, body = {}) {

        if(_.isEmpty(body)) body = '';
        else body = querystring.stringify(body);

        let message = String(timestamp) + String(method).toUpperCase() + request_path + (body === '' ? body : `?${body}`);
        let hash = require('crypto').createHmac('sha256', this.v3_api_secret).update(new Buffer(message)).digest('base64');
        return hash;

    },

    async createV3Request(method = 'get', request_path, body = {}) {
        const now = new Date().toISOString();

        return bottleneck.schedule(() => {
            return require('request-promise')[method]({
                uri: 'https://www.okex.com' + request_path + (_.isEmpty(body) ? '' : `?${querystring.stringify(body)}`),
                headers: {
                    'OK-ACCESS-KEY': this.v3_api_key,
                    'OK-ACCESS-SIGN': this.signv3(now, method, request_path, body),
                    'OK-ACCESS-TIMESTAMP': now,
                    'OK-ACCESS-PASSPHRASE': this.v3_api_passphrase
                },
                json: true,
                agent: this.agent
            });
        });
        
    }
};