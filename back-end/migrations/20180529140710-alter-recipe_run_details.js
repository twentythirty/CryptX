'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.renameColumn('recipe_run_detail', 'base_asset_id', 'transaction_asset_id').then(done => {
                return queryInterface.renameColumn('recipe_run_detail', 'target_asset_id', 'quote_asset_id');
            });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.renameColumn('recipe_run_detail', 'transaction_asset_id', 'base_asset_id').then(done => {
            return queryInterface.renameColumn('recipe_run_detail', 'quote_asset_id', 'target_asset_id');
        });
    }
};