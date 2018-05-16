'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.removeColumn(
            'recipe_order',
            'recipe_run_id'
        ).then(done => {

            return queryInterface.addColumn(
                'recipe_order',
                'recipe_order_group_id', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'recipe_order_group',
                        key: 'id'
                    },
                    onUpdate: 'cascade',
                    onDelete: 'cascade'
                })
        }).then(done => {

            return queryInterface.removeColumn(
                'recipe_order',
                'base_instrument_amount'
            )
        }).then(done => {

            return queryInterface.removeColumn(
                'recipe_order',
                'target_instrument_amount'
            )
        }).then(done => {

            return queryInterface.removeColumn(
                'recipe_order',
                'approve_user_id'
            )
        }).then(done => {

            return queryInterface.removeColumn(
                'recipe_order',
                'comment'
            )
        }).then(done => {

            return queryInterface.removeColumn(
                'recipe_order',
                'placed_timestamp'
            )
        }).then(done => {

            return queryInterface.renameColumn(
                'recipe_order',
                'target_instrument_price',
                'price'
            )
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.renameColumn(
            'recipe_order',
            'price',
            'target_instrument_price'
        ).then(done => {
            return queryInterface.addColumn(
                'recipe_order',
                'placed_timestamp', {
                    type: Sequelize.DATE
                }
            )
        }).then(done => {

            return queryInterface.addColumn(
                'recipe_order',
                'comment', {
                    type: Sequelize.TEXT('medium')
                }
            )
        }).then(done => {

            return queryInterface.addColumn(
                'recipe_order',
                'approve_user_id', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'user',
                        key: 'id'
                    },
                    onUpdate: 'cascade',
                    onDelete: 'cascade'
                }
            )
        }).then(done => {

            return queryInterface.addColumn(
                'recipe_order',
                'target_instrument_amount', {
                    type: Sequelize.DECIMAL
                })
        }).then(done => {

            return queryInterface.addColumn(
                'recipe_order',
                'base_instrument_amount', {
                    type: Sequelize.DECIMAL
                }
            )
        }).then( done => {

            return queryInterface.removeColumn(
                'recipe_order',
                'recipe_order_group_id'
            )
        }).then( done => {

            return queryInterface.addColumn(
                'recipe_order',
                'recipe_run_id', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'recipe_run',
                        key: 'id'
                    },
                    onUpdate: 'cascade',
                    onDelete: 'cascade'
                }
            )
        });
    }
};