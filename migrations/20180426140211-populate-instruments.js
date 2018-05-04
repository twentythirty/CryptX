"use strict";

const req_prom = require("request-promise");
const Instrument = require('../models').Instrument;
const InstrumentCoinMarketCapInfo = require('../models').InstrumentCoinMarketCapInfo;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return req_prom({
        uri: "https://api.coinmarketcap.com/v2/listings/",
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      })
      .then(resp => {
        const data = resp.data;
        console.log(
          "Got %s coins in response!",
          resp.metadata.num_cryptocurrencies
        );

        //individual coin insert with supporting object save
        return Promise.all(data.map(coin_data => {
          return Instrument.create({
            symbol: coin_data.symbol,
            long_name: coin_data.name,
            is_base: (coin_data.symbol === 'BTC' || coin_data.symbol === 'ETH'),
            is_blacklisted: false,
            tick_size: 0.0001
          }).then(instrument => {
            return InstrumentCoinMarketCapInfo.create({
                instrument_id: instrument.id,
                coinmarketcap_id: coin_data.id
              });
          });
        }));

      });
  },
  down: (queryInterface, Sequelize) => {

    return queryInterface.bulkDelete('instrument', {})
  }
};