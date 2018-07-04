'use strict';
module.exports = {

  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('investment_run_deposit').then(done => {

      return queryInterface.createTable('recipe_run_deposit', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        creation_timestamp: {
          type: Sequelize.DATE,
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
        planned_amount: {
          type: Sequelize.DECIMAL,
          allowNull: false
        },
        actual_amount: {
          type: Sequelize.DECIMAL,
          allowNull: false
        },
        depositor_user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "user",
            key: "id"
          },
          onUpdate: "cascade",
          onDelete: "cascade"
        },
        completion_timestamp: {
          type: Sequelize.DATE,
          allowNull: true
        },
        target_exchange_account: {
          type: Sequelize.INTEGER,
          references: {
            model: "exchange_account",
            key: "id"
          },
          onUpdate: "cascade",
          onDelete: "cascade"
        },
        status: {
          type: Sequelize.SMALLINT,
          allowNull: false
        }
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('recipe_run_deposit').then(done => {

      return queryInterface.createTable('investment_run_deposit', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        investment_run_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "investment_run",
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
    });
  }
};