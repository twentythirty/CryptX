'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('recipe_run_detail_investment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recipe_run_detail_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "recipe_run_detail",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      asset_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "asset",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('recipe_run_detail_investment');
  }
};