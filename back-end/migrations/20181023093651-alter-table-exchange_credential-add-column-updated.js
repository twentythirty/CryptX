'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('exchange_credential', 'updated', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('exchange_credential', 'updated');
  }
};
