"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("market_history_detail", {
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
      instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      price_usd: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      market_cap_usd: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      daily_volume_usd: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      market_cap_percentage: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      nvt_ratio: {
        type: Sequelize.DECIMAL,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("market_history_detail");
  }
};
