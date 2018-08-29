'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('execution_order', {
      fields: ['status'],
      name: 'execution_order_status'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('execution_order', 'execution_order_status'); 
  }
};
