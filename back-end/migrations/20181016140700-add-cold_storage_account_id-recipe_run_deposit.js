'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('recipe_run_deposit', 'cold_storage_account_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "cold_storage_account",
        key: "id"
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipe_run_deposit', 'cold_storage_account_id');
  }
};
