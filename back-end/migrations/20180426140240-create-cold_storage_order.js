'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cold_storage_order', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      execution_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "execution_order",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      cold_storage_account_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "cold_storage_account",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      placed_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      completed_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cold_storage_order');
  }
};