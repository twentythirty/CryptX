"use strict";

const req_prom = require("request-promise");

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
          "Got %s coins in response, taking first %s!",
          resp.metadata.num_cryptocurrencies, MAX_COINS
        );

        return queryInterface.bulkInsert("instrument",
          _.take(data, MAX_COINS).map(coin => {
            return {
              symbol: coin.symbol,
              long_name: coin.name,
              is_base: (coin.symbol === 'BTC' || coin.symbol === 'ETH'),
              tick_size: 0.00001
            }
          })
        );
      })
      .catch(err => {
        console.log("Coinmarketcap API ERROR: %o", err);
        process.exit(3);
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("instrument", {});
  }
};
