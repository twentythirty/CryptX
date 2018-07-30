'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipe_run_deposit', 'planned_amount').then(done => {

      return queryInterface.renameColumn('recipe_run_deposit', 'actual_amount', 'amount');
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('recipe_run_deposit', 'amount', 'actual_amount').then(done => {
      return queryInterface.addColumn('recipe_run_deposit', 'planned_amount', {
        type: Sequelize.DECIMAL,
        allowNull: false
      })
    });
  }
};