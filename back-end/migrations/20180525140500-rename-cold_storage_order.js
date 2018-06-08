'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('cold_storage_order', 'cold_storage_transfer');
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('cold_storage_transfer', 'cold_storage_order');
    }
};