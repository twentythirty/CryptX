'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('instrument_liquidity_requirement', 'exchange', {
      type: Sequelize.INTEGER,
      allowNull: true
    }).then(result => {
      return queryInterface.addConstraint('instrument_liquidity_requirement', ['exchange'], {
        type: 'foreign key',
        references: {
          table: 'exchange',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('instrument_liquidity_requirement', 'instrument_liquidity_requirement_exchange_fkey')
      .then(result => {
        return queryInterface.removeColumn('instrument_liquidity_requirement', 'exchange');
      });
  }
};
