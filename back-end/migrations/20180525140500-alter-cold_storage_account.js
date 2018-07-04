'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('cold_storage_account', 'custodian', {
            type: Sequelize.STRING,
            allowNull: false
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('cold_storage_account', 'custodian');
    }
};