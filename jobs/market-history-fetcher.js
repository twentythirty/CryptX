'use strict';
var request_promise = require('request-promise');

//fetch the top N coins info
const TOP_N = 500;
const LIMIT = 100;

var LATEST_TMC = 0;


module.exports.SCHEDULE = '0 0 */2 * * *';
module.exports.NAME = 'FETCH_MH';
module.exports.JOB_BODY = async (config) => {

    console.log(`1. Chunking required ${TOP_N} coins to limit ${LIMIT} and fetching all...`);
    //get how many hcunks are reuqired
    const chunks = Math.floor(TOP_N / LIMIT);
    if (TOP_N % LIMIT) {
        chunks++
    };
    //make list of chunked starts (1, 101, 201...)
    var starts = [];
    for (var i = 0; i < chunks; i++) {
        starts.push(1 + i * LIMIT);
    }

    console.log(`2. Fetching TMC and other metadata...`);

    //transmute starts to urls and make async requests
    return Promise.all([
        request_promise({
            uri: "https://api.coinmarketcap.com/v2/global/",
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: true
        })
    ].concat(starts.map(
        start => request_promise({
            uri: `https://api.coinmarketcap.com/v2/ticker/?start=${start}&limit=${LIMIT}`,
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: true
        })))).then(resp => {

        const [metadata, ...tickers] = resp;
        const data = metadata.data;

        const tmc = data.quotes.USD.total_market_cap;

        console.log(`
                Active currencies: ${data.active_cryptocurrencies},
                BTC dominance: ${data.bitcoin_percentage_of_market_cap}%,
                Total Market Cap: ${tmc}

                Last updated: ${new Date(data.last_updated * 1000)}
            `);

        console.log(`3. Flatteninig tickers and fetching reuqired DB coin ids...`)

        //smooth out tickers data
        const tickers_flat = (tickers[0] && tickers[0].data) ? tickers[0] : {
            data: {}
        };
        for (var i = 1; i < tickers.length; i++) {
            tickers_flat.data = Object.assign(tickers_flat.data, tickers[i].data);
        }
        console.log(`discovered tickers with ${Object.keys(tickers_flat.data).length} data points`);

        //fetch instrument ids
        return Promise.all([
            Promise.resolve(tmc),
            Promise.resolve(tickers_flat),
            config.models.AssetBlockchain.findAll({
                attributes: ['asset_id', 'coinmarketcap_identifier'],
                where: {
                    coinmarketcap_identifier: Object.keys(tickers_flat.data)
                }
            })
        ])
    }).then(data => {

        console.log(`4. Putting ids to tickers...`);

        const [tmc, tickers, coin_asset_ids] = data;

        const key_assets = _.keyBy(coin_asset_ids, (obj) => {
            return obj.coinmarketcap_identifier;
        });

        const filtered_tickers_data = _.pickBy(tickers.data, (ticker_data, id) => {

            const pair = key_assets[id];
            if (!pair) {
                console.log(`Rejected ticker data ${ticker_data} because id ${id} has no associated blockchain instrument!`);
                return false;
            }
            return true;
        });
        return _.map(filtered_tickers_data, (ticker_data, id) => {

            //safe since filtered
            const pair = key_assets[id];
            const usd_details = ticker_data.quotes.USD;

            return {
                asset_id: pair.asset_id,
                timestamp: new Date(tickers.metadata.timestamp * 1000),
                capitalization_usd: usd_details.market_cap,
                daily_volume_usd: usd_details.volume_24h,
                market_share_percentage: (usd_details.market_cap / tmc) * 100
            }
        });
    }).then(data_objects => {

        console.log(`5. persisting ${data_objects.length} observations...`);

        return config.models.AssetMarketCapitalization.bulkCreate(data_objects);
    }).then(() => {

        console.log('Pulling market history finished!')
    });
};