"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("instrument_liquidity_requirement", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      minimum_volume: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      periodicity_in_days: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("instrument_liquidity_requirement");
  }
};