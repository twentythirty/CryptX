'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('investment_run', {
      fields: ['status'],
      name: 'investment_run_status'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('investment_run', 'investment_run_status'); 
  }
};
