'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('recipe_run_deposit', 'fee', {
      type: Sequelize.DECIMAL,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipe_run_deposit', 'fee');
  }
};

