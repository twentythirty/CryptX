'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.renameColumn('instrument', 'base_asset_id', 'transaction_asset_id').then(done => {
                return queryInterface.renameColumn('instrument', 'target_asset_id', 'quote_asset_id');
            });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.renameColumn('instrument', 'transaction_asset_id', 'base_asset_id').then(done => {
            return queryInterface.renameColumn('instrument', 'quote_asset_id', 'target_asset_id');
        });
    }
};