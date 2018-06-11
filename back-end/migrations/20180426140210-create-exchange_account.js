"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("exchange_account", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        unique: false
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
      exchange_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "exchange",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      external_identifier: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("exchange_account");
  }
};