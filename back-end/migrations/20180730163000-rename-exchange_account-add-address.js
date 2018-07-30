'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('exchange_account', 'external_identifier', 'address');
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('exchange_account', 'address', 'external_identifier');
  }
};