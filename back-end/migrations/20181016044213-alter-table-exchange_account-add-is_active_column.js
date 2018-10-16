'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('exchange_account', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('exchange_account', 'is_active');
  }
};
