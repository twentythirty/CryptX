"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("instrument_market_data", {
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
      exchange_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "exchange",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      ask_price: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      bid_price: {
        type: Sequelize.DECIMAL,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("instrument_market_data");
  }
};
