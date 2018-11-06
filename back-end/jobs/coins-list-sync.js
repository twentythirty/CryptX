'use strict';
var request_promise = require('request-promise');


//3 times a day, 5 min passed the hour
module.exports.SCHEDULE = '0 5 */8 * * *';
module.exports.NAME = 'SYNC_COINS';
module.exports.JOB_BODY = async (config, log) => {

    const {
        Asset,
        AssetBlockchain,
        sequelize
    } = config.models;

    (`1. Fetching CoinMarketCap coins and existing blockchain assets... `);

    return Promise.all([
        config.models.AssetBlockchain.findAll(),
        request_promise.get({
            uri: "https://api.coinmarketcap.com/v2/listings/",
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: true
        })
    ]).then(assetsAndResp => {

        const [assets, resp] = assetsAndResp;

        const data = resp.data;
        log(`2a. Got ${resp.metadata.num_cryptocurrencies} coins in HTTP response!`);
        log(`2b. Got ${assets.length} coins from assets table!`);

        //get the difference ids
        const missing_ids = _.difference(
            _.map(data, 'id'),
            //asset external identifier is a string by type, parse for safe equals
            _.map(assets, asset => parseInt(asset.coinmarketcap_identifier, 10))
        );

        if (missing_ids.length == 0) {
            log(`No missing ids found, all CoinMarketCap ids are in the system!...`);
            return "ALL_PRESENT";
        }

        log(`3. Got ${missing_ids.length} coins still not in the system, adding...`);

        //filter down initial data list just to the missing coins
        const missing_coins = _.filter(data, coin => missing_ids.includes(coin.id))

        //create coin insertion chain
        const insert_coins_chain = missing_coins.reduce((acc, coin_data) => {
            return acc.then(prev => {
                return sequelize.transaction(transaction => {
                    return config.models.Asset.create({
                        symbol: coin_data.symbol,
                        long_name: coin_data.name,
                        is_base: (coin_data.symbol === 'BTC' || coin_data.symbol === 'ETH'),
                        is_deposit: (coin_data.symbol === 'BTC' || coin_data.symbol === 'ETH')
                    }, {
                        transaction
                    }).then(asset => {
                        return config.models.AssetBlockchain.create({
                            asset_id: asset.id,
                            coinmarketcap_identifier: `${coin_data.id}`
                        }, {
                            transaction
                        })
                    })
                })
            })
        }, Promise.resolve())

        //individual coin insert with supporting object save
        return Promise.resolve(insert_coins_chain);
    });
};