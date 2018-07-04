'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('execution_order', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recipe_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "recipe_order",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      type: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      total_quantity: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      placed_timestamp: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_timestamp: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('execution_order');
  }
};