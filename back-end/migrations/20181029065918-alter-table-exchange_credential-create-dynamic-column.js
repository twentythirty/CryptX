'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('exchange_credential', 'admin_password');
    return queryInterface.addColumn('exchange_credential', 'additional_params', {
      type: Sequelize.BLOB,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('exchange_credential', 'admin_password', {
      type: Sequelize.BLOB,
      allowNull: true
    });
    return queryInterface.removeColumn('exchange_credential', 'additional_params');
  }
};
