"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_role", {
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "role",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_role");
  }
};