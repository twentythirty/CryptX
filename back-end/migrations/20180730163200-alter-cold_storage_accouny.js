'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.addColumn(
            'cold_storage_account', 'cold_storage_custodian_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: "cold_storage_custodian",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            }).then(done => {
            return queryInterface.removeColumn('cold_storage_account', 'custodian')
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('cold_storage_account', 'cold_storage_custodian_id')
            .then(done => {
                return queryInterface.addColumn('cold_storage_account', 'custodian', {
                    type: Sequelize.STRING,
                });
            });
    }
};