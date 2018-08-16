'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addConstraint('instrument_exchange_mapping', ['instrument_id', 'exchange_id'], {
            type: 'unique',
            name: 'instrument_exchange_mapping_unique_pair_constraint'
          });
    },
    down: (queryInterface, Sequelize) => {
        //Replaces it with the old migration query
        return queryInterface.addConstraint('instrument_exchange_mapping', 'instrument_exchange_mapping_unique_pair_constraint');
    }
};