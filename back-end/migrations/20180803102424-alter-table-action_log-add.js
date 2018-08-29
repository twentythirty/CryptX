'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('action_log', 'recipe_run_deposit_id', {
      type: Sequelize.SMALLINT,
      allowNull: true
    }).then(() => {
      return queryInterface.addConstraint('action_log', ['recipe_run_deposit_id'], {
        type: 'foreign key',
        references: {
          table: 'recipe_run_deposit',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('action_log', 'action_log_recipe_run_deposit_id_fkey').then(() => {
      return queryInterface.removeColumn('action_log', 'recipe_run_deposit_id');
    });
  }
};
