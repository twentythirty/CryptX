'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // set BTC and ETH asset is_deposit = true
    let symbols = ['BTC', 'ETH'];
    let Asset = require('../models').Asset;
    return Asset.update({
      is_deposit: true
    }, {
      fields: [ 'is_deposit' ],
      where: {
        symbol: symbols
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    // set BTC and ETH asset is_deposit = false
    let symbols = ['BTC', 'ETH'];
    let Asset = require('../models').Asset;
    return Asset.update({
      is_deposit: false
    }, {
      fields: [ 'is_deposit' ],
      where: {
        symbol: symbols
      }
    });
  }
};