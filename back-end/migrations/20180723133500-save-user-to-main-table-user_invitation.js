'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.dropTable("user_invitation_role").then(() => {
            return queryInterface.removeColumn("user_invitation", "first_name");
        }).then(() => {
            return queryInterface.removeColumn("user_invitation", "last_name");
        }).then(() => {
            return queryInterface.addColumn("user_invitation", "user_id", {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                  model: "user",
                  key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            });
        });
    },
    down: (queryInterface, Sequelize) => {
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
          })
        .then(() => {
            queryInterface.removeColumn("user_invitation", "user_id")
        }).then(() => {
            return queryInterface.addColumn("user_invitation", "first_name", {
                type: Sequelize.STRING,
                allowNull: true
            });
        }).then(() => {
            return queryInterface.addColumn("user_invitation", "role_id", {
                type: Sequelize.INTEGER,
                references: {
                    model: "role",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            });
        }).then(() => {
            return queryInterface.removeColumn("user_invitation", "last_name", {
                type: Sequelize.STRING,
                allowNull: true
            });  
        });
    }
};