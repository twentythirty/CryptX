'use strict';
var request_promise = require('request-promise');

//fetch the top N coins info
const TOP_N = 500;
const LIMIT = 100;

//Exported for cucumber test syncing
module.exports.TOP_N = TOP_N;
module.exports.LIMIT = LIMIT;

module.exports.SCHEDULE = '0 0 */2 * * *';
module.exports.NAME = 'FETCH_MH';
module.exports.JOB_BODY = async (config, log) => {

    log(`1. Chunking required ${TOP_N} coins to limit ${LIMIT} and fetching all...`);

    //get how many chuncks are reuqired
    const chunks = Math.floor(TOP_N / LIMIT);
    if (TOP_N % LIMIT) {
        chunks++
    };

    //make list of chunked starts (1, 101, 201...)
    var starts = [];
    for (var i = 0; i < chunks; i++) {
        starts.push(1 + i * LIMIT);
    }

    log(`2. Fetching TMC and other metadata...`);

    const models = config.models;
    const sequelize = models.sequelize;
    const Asset = models.Asset;
    const AssetBlockchain = models.AssetBlockchain;
    const AssetMarketCapitalization = models.AssetMarketCapitalization;

    //transmute starts to urls and make async requests
    return Promise.all(
        [
            //fetch metadata object
            request_promise.get({
                uri: "https://api.coinmarketcap.com/v2/global/",
                headers: {
                    "User-Agent": "Request-Promise"
                },
                json: true
            })
        ].concat(starts.map(
            //fetch all tickers in batches with start offsets
            start => request_promise.get({
                uri: `https://api.coinmarketcap.com/v2/ticker/?start=${start}&limit=${LIMIT}`,
                headers: {
                    "User-Agent": "Request-Promise"
                },
                json: true
            })
        ))
    ).then(resp => {

        const [metadata, ...tickers] = resp;
        const data = metadata.data;

        const tmc = data.quotes.USD.total_market_cap;

        log(`
                Active currencies: ${data.active_cryptocurrencies},
                BTC dominance: ${data.bitcoin_percentage_of_market_cap}%,
                Total Market Cap: ${tmc}

                Last updated: ${new Date(data.last_updated * 1000)}
            `);

        log(`3. Flatteninig tickers and fetching reuqired DB coin ids...`)

        //smooth out tickers data
        const tickers_flat = (tickers[0] && tickers[0].data) ? tickers[0] : {
            data: {}
        };
        for (var i = 1; i < tickers.length; i++) {
            tickers_flat.data = Object.assign(tickers_flat.data, tickers[i].data);
        }
        log(`discovered tickers with ${Object.keys(tickers_flat.data).length} data points`);

        //fetch instrument ids
        return Promise.all([
            Promise.resolve(tmc),
            Promise.resolve(tickers_flat),
            AssetBlockchain.findAll({
                attributes: ['asset_id', 'coinmarketcap_identifier'],
                where: {
                    coinmarketcap_identifier: Object.keys(tickers_flat.data)
                }
            })
        ])
    }).then(data => {

        log(`4. Putting ids to tickers...`);

        const [tmc, tickers, coin_asset_ids] = data;

        const timestamp = new Date(tickers.metadata.timestamp * 1000);

        const key_assets = _.keyBy(coin_asset_ids, 'coinmarketcap_identifier');

        let missing_tickers_data = {}

        const filtered_tickers_data = _.pickBy(tickers.data, (ticker_data, id) => {

            const pair = key_assets[id];
            if (!pair) {
                log(`${JSON.stringify(ticker_data)} with id ${id} has no associated blockchain instrument, handling in post...!`);
                missing_tickers_data[id] = ticker_data
                return false;
            }
            return true;
        });

        log(`4.5 Immediately persisting ${Object.keys(filtered_tickers_data).length} market data points. Additionally creating ${Object.keys(missing_tickers_data).length} coins with market data...`)

        const market_cap_objects = _.map(filtered_tickers_data, (ticker_data, id) => {

            //safe since filtered
            const pair = key_assets[id];
            const usd_details = ticker_data.quotes.USD;

            return {
                asset_id: pair.asset_id,
                timestamp: timestamp,
                capitalization_usd: usd_details.market_cap,
                daily_volume_usd: usd_details.volume_24h,
                market_share_percentage: (usd_details.market_cap / tmc) * 100
            }
        });

        const save_asset_promises = _.map(missing_tickers_data, (ticker_data, coinmarketcap_id) => {

            return Promise.all([
                Promise.resolve(coinmarketcap_id),
                Asset.findCreateFind({
                    where: sequelize.where(
                        sequelize.fn('lower', 
                            sequelize.fn('regexp_replace', sequelize.col('long_name'), '(\s+|\,|\.|\!)', '', 'g')
                        ),
                        ticker_data.name.toLowerCase().replace(/(\s+|\,|\.|\!)/g, '')
                    ),
                    defaults: {
                        symbol: ticker_data.symbol,
                        long_name: ticker_data.name,
                        is_base: (ticker_data.symbol === 'BTC' || ticker_data.symbol === 'ETH'),
                        is_deposit: (ticker_data.symbol === 'BTC' || ticker_data.symbol === 'ETH')
                    }
                })
            ]).then(id_asset => {
                const [
                    coinmarketcap_id, [asset, created]
                ] = id_asset;

                return AssetBlockchain.create({
                    asset_id: asset.id,
                    coinmarketcap_identifier: coinmarketcap_id
                })
            })
        })

        //save market data for existing coins, but also save new coins and create market data for them in next step
        return Promise.all([
            //pass configured market cap objects
            Promise.resolve(market_cap_objects),
            //pass the new created assets with blockchain part returns
            Promise.all(save_asset_promises),
            //transfer reuqired tickers data
            Promise.resolve(missing_tickers_data),
            //transfer timestamp and market cap constants
            Promise.all([
                Promise.resolve(timestamp),
                Promise.resolve(tmc)
            ])
        ])
    }).then(data_objects => {

        const [
            preloaded_market_cap, //market cap data already configured (ripe for saving)
            asset_blockchains, //newly created asset blockchains
            new_tickers_data, //tickers data for new blockchains
            [timestamp, tmc] //constants to create market cap with new tickers
        ] = data_objects;

        log(`5. Persisting ${Object.keys(asset_blockchains).length} new market caps...`)

        //assets lookup by coinmarketcap id
        const asset_lookup = _.keyBy(asset_blockchains, 'coinmarketcap_identifier');

        const new_market_cap = _.map(new_tickers_data, (ticker_data, id) => {

            const asset_blockchain = asset_lookup[id];
            const usd_details = ticker_data.quotes.USD;

            return {
                asset_id: asset_blockchain.asset_id,
                timestamp: timestamp,
                capitalization_usd: usd_details.market_cap,
                daily_volume_usd: usd_details.volume_24h,
                market_share_percentage: (usd_details.market_cap / tmc) * 100
            }
        })

        //save all in one bulk query (since sequelize has bugs and cant work with these earlier)
        return AssetMarketCapitalization.bulkCreate(_.concat(preloaded_market_cap, new_market_cap))
    });
};