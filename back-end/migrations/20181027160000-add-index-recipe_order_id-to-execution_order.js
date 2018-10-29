'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('execution_order', {
      fields: ['recipe_order_id'],
      name: 'execution_order_recipe_order_id'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('execution_order', 'execution_order_recipe_order_id');
  }
};
