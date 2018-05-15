'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('recipe_run_detail', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recipe_run_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "recipe_run",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      base_instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      target_instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      target_exchange_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "exchange",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      investment_percentage: {
        type: Sequelize.DECIMAL,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('recipe_run_detail');
  }
};