'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
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
      instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
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
    return queryInterface.dropTable('investment_run_deposit');
  }
};