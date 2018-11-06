'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('instrument_liquidity_history', 'quote_volume', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('instrument_liquidity_history', 'quote_volume')
  }
};
