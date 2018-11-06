'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('recipe_order', {
      fields: ['status'],
      name: 'recipe_order_status'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('recipe_order', 'recipe_order_status'); 
  }
};
