"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_session", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      expiry_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ip_address: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_session");
  }
};
