'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('recipe_run', {
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
      user_created_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      created_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT('medium'),
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('recipe_run');
  }
};