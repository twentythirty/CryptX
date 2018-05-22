'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('action_log', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      performing_user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      user_session_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user_session",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      permission_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "permission",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "role",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      asset_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "asset",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      exchange_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "exchange",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      exchange_account_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "exchange_account",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      investment_run_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "investment_run",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      recipe_run_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "recipe_run",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      recipe_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "recipe_order",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      execution_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "execution_order",
          key: "id"
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      details: {
        type: Sequelize.TEXT('medium'),
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('action_log');
  }
};