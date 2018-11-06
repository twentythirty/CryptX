"use strict";

const req_prom = require("request-promise");
const Asset = require('../models').Asset;
const AssetBlockchain = require('../models').AssetBlockchain;

module.exports = {
  up: (queryInterface, Sequelize) => {
    //insert the american dollar
    return queryInterface.bulkInsert('asset', [{
      symbol: 'USD',
      long_name: 'US Dollars',
      is_base: false,
      is_deposit: true
    }]).then(() => {

      return req_prom({
        uri: "https://api.coinmarketcap.com/v2/listings/",
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      });
    }).then(resp => {
      const data = resp.data;
      console.log(
        "Got %s coins in response!",
        resp.metadata.num_cryptocurrencies
      );
      
      //chain all coins saving into one promise chain
      const coins_promise_chain = data.reduce((acc, coin_data) => {
        return acc.then(prev => {
          return Asset.create({
            symbol: coin_data.symbol,
            long_name: coin_data.name,
            is_base: (coin_data.symbol === 'BTC' || coin_data.symbol === 'ETH')
          }).then(asset => {
            return AssetBlockchain.create({
              asset_id: asset.id,
              coinmarketcap_identifier: `${coin_data.id}`
            })
          })
        })
      }, Promise.resolve());
      //individual coin insert with supporting object save
      return Promise.resolve(coins_promise_chain);
    }).then(assets_blockchain => {
      //bring focus back to assets
      return Asset.findAll()
    }).then(assets => {
      //insert the 2 basic instruments - exchange dollars for base tokens
      const usd = _.find(assets, asset => asset.symbol === 'USD');
      const base_assets = _.filter(assets, 'is_base');

      return queryInterface.bulkInsert('instrument', _.map(base_assets, base_asset => {

        return {
          base_asset_id: base_asset.id,
          target_asset_id: usd.id
        }
      }));
    });
  },
  down: (queryInterface, Sequelize) => {

    return AssetBlockchain.findAll({
      attributes: ['asset_id']
    }).then(blockchain_ids => {

      return queryInterface.bulkDelete('asset', {
        where: {
          id: blockchain_ids
        }
      })
    });

  }
};