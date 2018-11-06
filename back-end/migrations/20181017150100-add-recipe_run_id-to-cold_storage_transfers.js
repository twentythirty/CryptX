'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('cold_storage_transfer', 'recipe_run_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "recipe_run",
        key: "id"
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.remove('cold_storage_transfer', 'recipe_run_id');
  }
};