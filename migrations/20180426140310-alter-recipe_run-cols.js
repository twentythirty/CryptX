'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.renameColumn(
            'recipe_run',
            'status',
            'approval_status'
        ).then(done => {

            return queryInterface.renameColumn(
                'recipe_run',
                'comment',
                'approval_comment'
            )
        }).then(done => {

            return queryInterface.addColumn(
                'recipe_run',
                'approval_timestamp', {
                    type: Sequelize.DATE,
                    allowNull: false
                })
        }).then(done => {

            return queryInterface.addColumn(
                'recipe_run',
                'approval_user_id', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'user',
                        key: 'id'
                    },
                    onUpdate: 'cascade',
                    onDelete: 'cascade'
                }
            )
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            'recipe_run', 
            'approval_user_id'
        ).then(done => {
            return queryInterface.removeColumn(
                'recipe_run',
                'approval_timestamp'
            )
        }).then(done => {

            return queryInterface.renameColumn(
                'recipe_run',
                'approval_comment',
                'comment'
            )
        }).then(done => {

            return queryInterface.renameColumn(
                'recipe_run',
                'approval_status',
                'status'
            )
        });
    }
};