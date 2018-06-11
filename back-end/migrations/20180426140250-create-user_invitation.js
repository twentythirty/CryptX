'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('user_invitation', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            was_used: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            creator_id: {
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
                allowNull: false
            },
            token_expiry_timestamp: {
                type: Sequelize.DATE,
                allowNull: false
            },
            role_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "role",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('user_invitation');
    }
};