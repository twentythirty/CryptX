'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('recipe_run', {
      fields: ['approval_status'],
      name: 'recipe_run_approval_status'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('recipe_run', 'recipe_run_approval_status'); 
  }
};
