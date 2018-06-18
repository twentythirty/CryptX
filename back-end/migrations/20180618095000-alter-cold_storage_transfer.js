'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {

        //create permissions categories table
        return queryInterface.addColumn(
            'cold_storage_transfer', 'recipe_run_order_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: "recipe_order",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            }).then(done => {
            return queryInterface.removeColumn('cold_storage_transfer', 'execution_order_id')
        }).then(done => {
            return queryInterface.addColumn('cold_storage_transfer', 'asset_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: "asset",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            }).then(done => {
                return queryInterface.addColumn('cold_storage_transfer', 'amount_decimal', {
                    type: Sequelize.DECIMAL,
                    allowNull: false
                })
            })
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('cold_storage_transfer', 'amount_decimal').then(done => {
            return queryInterface.removeColumn('cold_storage_transfer', 'asset_id');
        }).then(done => {
            return queryInterface.removeColumn('cold_storage_transfer', 'recipe_run_order_id');
        }).then(done => {
            return queryInterface.addColumn('cold_storage_transfer', 'execution_order_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: "execution_order",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            });
        });
    }
};