'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('action_log', 'cold_storage_transfer_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    }).then(() => {
      return queryInterface.addConstraint('action_log', ['cold_storage_transfer_id'], {
        type: 'foreign key',
        references: {
          table: 'cold_storage_transfer',
          field: 'id'
        },
        onDelete: 'set null',
        onUpdate: 'cascade'
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('action_log', 'cold_storage_transfer_id');
  }
};
