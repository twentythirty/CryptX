'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('instrument_market_data', {
      fields: [{ attribute: 'timestamp', order: 'DESC'}]
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('instrument_market_data', 'timestamp');
  }
};
