'use strict';

const mu = require('../utils/MigrationUtil');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('execution_order', 'exchange_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'exchange',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        }).then(done => {
            return queryInterface.addColumn('execution_order', 'external_identifier', {
                type: Sequelize.STRING,
                allowNull: true
            })
        }).then(done => {

            return queryInterface.addColumn('execution_order', 'side', {
                type: Sequelize.SMALLINT
            })
        }).then(done => {

            return queryInterface.addColumn('execution_order', 'time_in_force', {
                type: Sequelize.DATE,
                allowNull: true
            })
        })
    },
    down: (queryInterface, Sequelize) => {
        return mu.remove_cols_recur(queryInterface, [
            'time_in_force',
            'side',
            'external_identifier',
            'exchange_id'
        ]);
    }
};