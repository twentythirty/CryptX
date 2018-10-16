'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('instrument_liquidity_history', 'timestamp_from', {
            type: Sequelize.DATE
        }).then(done => {

            return queryInterface.renameColumn('instrument_liquidity_history', 'date', 'timestamp_to');
        }).then(done => {
            //update any existing liquidities
            return Promise.resolve(queryInterface.sequelize.query(`
                UPDATE instrument_liquidity_history
                SET timestamp_from = timestamp_to - INTERVAL '1 DAY'
            `));
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            'instrument_liquidity_history', 'timestamp_from'
        ).then(done => {
            return queryInterface.renameColumn('instrument_liquidity_history', 'timestamp_to', 'date');
        });
    }
};