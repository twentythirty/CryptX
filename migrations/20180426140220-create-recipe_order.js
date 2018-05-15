'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('recipe_order', {
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
      base_instrument_amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      target_instrument_amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      target_instrument_price: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      approve_user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      comment: {
        type: Sequelize.TEXT('medium'),
        allowNull: false
      },
      placed_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('recipe_order');
  }
};