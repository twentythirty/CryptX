'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('cold_storage_transfer', 'fee', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0.0
    }).then(done => {

      return queryInterface.renameColumn('cold_storage_transfer', 'amount_decimal', 'amount');
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('cold_storage_transfer', 'fee').then(done => {
      return queryInterface.renameColumn('cold_storage_transfer', 'amount', 'amount_decimal');
    });
  }
};
