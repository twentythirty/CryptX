'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipe_order', 'recipe_run_id');
  },
  down: (queryInterface, Sequelize) => {

    return queryInterface.addColumn('recipe_order', 'recipe_run_id', {
      type: Sequelize.INTEGER,
        references: {
          model: "recipe_run",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
    })
  }
};