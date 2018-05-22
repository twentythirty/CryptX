"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("asset_market_capitalization", {
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
      asset_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "asset",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      capitalization_usd: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      market_share_percentage: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      daily_volume_usd: {
        type: Sequelize.DECIMAL,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("asset_market_capitalization");
  }
};
