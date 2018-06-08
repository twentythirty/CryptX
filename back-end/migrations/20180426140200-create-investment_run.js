'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('investment_run', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      started_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      completed_timestamp: {
        type: Sequelize.DATE,
        allowNull: true
      },
      user_created_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      strategy_type: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      is_simulated: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('investment_run');
  }
};