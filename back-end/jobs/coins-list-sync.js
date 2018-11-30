'use strict';
var request_promise = require('request-promise');
const CoinMarketCap = require('../utils/CoinMarketCap');

const { logAction } = require('../utils/ActionLogUtil');

const action_path = 'assets';

const actions = {
  name_changed: `${action_path}.name_changed`,
  symbol_changed: `${action_path}.symbol_changed`,
};


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
        config.models.AssetBlockchain.findAll({
            include: Asset
        }),
        /*request_promise.get({
            uri: "https://api.coinmarketcap.com/v2/listings/",
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: true
        })*/
        CoinMarketCap.get('/cryptocurrency/map')

    ]).then(async assetsAndResp => {

        const [assets, resp] = assetsAndResp;

        const data = resp.data;
        log(`2a. Got ${data.length} coins in HTTP response!`);
        log(`2b. Got ${assets.length} coins from assets table!`);

        await Promise.all(_.map(data, async coin => {
            let found_asset = assets.find(a => a.coinmarketcap_identifier==coin.id);

            if (found_asset) {
                let asset = found_asset.Asset;

                if (asset.long_name != coin.name || asset.symbol != coin.symbol) {
                    console.log(asset.long_name + ' was found not having correct data');

                    if (asset.long_name != coin.name) {
                        let prev = asset.long_name;
                        asset.long_name = coin.name;

                        await logAction(actions.name_changed, {
                            args: { 
                              from: prev,
                              to: asset.long_name
                            },
                            relations: { asset_id: asset.id }
                        });
                    }
                    if (asset.symbol != coin.symbol) {
                        let prev = asset.symbol;
                        asset.symbol = coin.symbol;

                        await logAction(actions.symbol_changed, {
                            args: { 
                                from: prev,
                                to: asset.symbol
                            },
                            relations: { asset_id: asset.id }
                        });
                    }

                    return asset.save();
                } 
            } else return true;
        }));
        
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