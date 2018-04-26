"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("role_permission", {
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "role",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      permission_id: {
        type: 'enum_permission_id',
        references: {
          model: 'permission',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("role_permission");
  }
};