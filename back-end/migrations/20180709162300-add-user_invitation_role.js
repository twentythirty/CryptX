"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_invitation_role", {
      user_invitation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "user_invitation",
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
    }).then((data) => {
      return queryInterface.removeColumn('user_invitation', 'role_id');
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_invitation_role").then(() => {
      return queryInterface.addColumn('user_invitation', 'role_id', {
          type: Sequelize.INTEGER,
          references: {
              model: "role",
              key: "id"
          },
          onUpdate: "cascade",
          onDelete: "cascade"
      });
    });
  }
};