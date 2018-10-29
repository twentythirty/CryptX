'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('recipe_order_group', {
      fields: ['approval_status'],
      name: 'recipe_order_group_approval_status'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('recipe_order_group', 'recipe_order_group_approval_status'); 
  }
};
