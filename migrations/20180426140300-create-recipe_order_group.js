'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.createTable('recipe_order_group', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
              },
              reciep_run_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'recipe_run',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
              },
              created_timestamp: {
                  type: Sequelize.DATE,
                  allowNull: false
              },
              approval_status: {
                  type: Sequelize.SMALLINT,
                  allowNull: false
              },
              approval_user_id: {
                  type: Sequelize.INTEGER,
                  references: {
                      model: 'user',
                      key: 'id'
                  },
                  onUpdate: 'cascade',
                  onDelete: 'cascade'
              },
              approval_timestamp: {
                  type: Sequelize.DATE,
                  allowNull: false
              },
              approval_comment: {
                  type: Sequelize.TEXT('medium'),
                  allowNull: false
              }
        });
    },
    down: (queryInterface, Sequelize) => {

        return queryInterface.dropTable('recipe_order_group');
    }
};