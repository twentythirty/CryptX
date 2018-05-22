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

      //individual coin insert with supporting object save
      return Promise.all(data.map(coin_data => {
        return Asset.create({
          symbol: coin_data.symbol,
          long_name: coin_data.name,
          is_base: (coin_data.symbol === 'BTC' || coin_data.symbol === 'ETH')
        }).then(asset => {
          return AssetBlockchain.create({
            asset_id: asset.id,
            coinmarketcap_identifier: `${coin_data.id}`
          });
        });
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