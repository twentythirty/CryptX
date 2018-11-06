'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('instrument_liquidity_history', 'instrument_liquidity_history_instrument_id_fkey').then(() => {
      return queryInterface.addConstraint('instrument_liquidity_history', ['instrument_id'], {
        type: 'foreign key',
        name: 'instrument_liquidity_history_instrument_id_fkey',
        references: { 
          table: 'instrument',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('instrument_liquidity_history', 'instrument_liquidity_history_instrument_id_fkey').then(() => {
      return queryInterface.addConstraint('instrument_liquidity_history', ['instrument_id'], {
        type: 'foreign key',
        name: 'instrument_liquidity_history_instrument_id_fkey',
        references: { 
          table: 'instrument',
          field: 'id'
        },
        onDelete: 'no action',
        onUpdate: 'cascade'
      });
    });
  }
};
