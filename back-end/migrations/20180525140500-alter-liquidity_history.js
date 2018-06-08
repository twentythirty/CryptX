'use strict';

const InstrumentLiquidityHistory = require('../models').InstrumentLiquidityHistory;

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('instrument_liquidity_history', 'timestamp_from', {
            type: Sequelize.DATE
        }).then(done => {

            return queryInterface.renameColumn('instrument_liquidity_history', 'date', 'timestamp_to');
        }).then(done => {

            //update liquidity according to new dates (add 24h ago start)
            return InstrumentLiquidityHistory.findAll();
        }).then(histories => {

            return Promise.all(_.map(_.filter(histories, 'timestamp_to'), history => {
                
                history.timestamp_from = new Date(history.timestamp_to.getTime() - (24 * 60 * 60 * 1000));
                return history.save();
            }));
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