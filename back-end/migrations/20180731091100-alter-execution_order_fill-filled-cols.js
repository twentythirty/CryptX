'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('execution_order_fill', 'fee', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0.0
    }).then(done => {
      return queryInterface.renameColumn('execution_order_fill', 'fill_timestamp', 'timestamp')
    }).then(done => {
      return queryInterface.renameColumn('execution_order_fill', 'filled_quantity', 'quantity')
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('execution_order_fill', 'fee')
    .then(done => {
      return queryInterface.renameColumn('execution_order_fill', 'timestamp', 'fill_timestamp')
    }).then(done => {
      return queryInterface.renameColumn('execution_order_fill', 'filled_quantity', 'quantity')
    });
  }
};
