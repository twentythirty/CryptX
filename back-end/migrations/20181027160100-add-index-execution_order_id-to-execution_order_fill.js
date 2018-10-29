'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('execution_order_fill', {
      fields: ['execution_order_id'],
      name: 'execution_order_fill_execution_order_id'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('execution_order_fill', 'execution_order_fill_execution_order_id');
  }
};
