'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const constraints = [
      ['asset', 'action_log_asset_id_fkey'],
      ['exchange_account', 'action_log_exchange_account_id_fkey'],
      ['exchange', 'action_log_exchange_id_fkey'],
      ['execution_order', 'action_log_execution_order_id_fkey'],
      ['instrument', 'action_log_instrument_id_fkey'],
      ['investment_run', 'action_log_investment_run_id_fkey'],
      ['performing_user', 'action_log_performing_user_id_fkey'],
      ['permission', 'action_log_permission_id_fkey'],
      ['recipe_order', 'action_log_recipe_order_id_fkey'],
      ['recipe_run_deposit', 'action_log_recipe_run_deposit_id_recipe_run_deposit_fk'],
      ['recipe_run', 'action_log_recipe_run_id_fkey'],
      ['role', 'action_log_role_id_fkey'],
      ['user', 'action_log_user_id_fkey'],
      ['user_session', 'action_log_user_session_id_fkey']
    ];
    return Promise.all(constraints.map(constraint => {
      const [table, key] = constraint;
      return queryInterface.removeConstraint('action_log', key)
        .then(() => {
          return queryInterface.addConstraint('action_log', [`${table}_id`], {
            type: 'foreign key',
            name: key,
            references: {
              table: table === 'performing_user' ? 'user' : table,
              field: 'id'
            },
            onDelete: 'set NULL',
            onUpdate: 'cascade'
        })
      });
    }));
  },

  down: (queryInterface, Sequelize) => {
    const constraints = [
      ['asset', 'action_log_asset_id_fkey'],
      ['exchange_account', 'action_log_exchange_account_id_fkey'],
      ['exchange', 'action_log_exchange_id_fkey'],
      ['execution_order', 'action_log_execution_order_id_fkey'],
      ['instrument', 'action_log_instrument_id_fkey'],
      ['investment_run', 'action_log_investment_run_id_fkey'],
      ['performing_user', 'action_log_performing_user_id_fkey'],
      ['permission', 'action_log_permission_id_fkey'],
      ['recipe_order', 'action_log_recipe_order_id_fkey'],
      ['recipe_run_deposit', 'action_log_recipe_run_deposit_id_recipe_run_deposit_fk'],
      ['recipe_run', 'action_log_recipe_run_id_fkey'],
      ['role', 'action_log_role_id_fkey'],
      ['user', 'action_log_user_id_fkey'],
      ['user_session', 'action_log_user_session_id_fkey']
    ];
    return Promise.all(constraints.map(constraint => {
      const [table, key] = constraint;
      return queryInterface.removeConstraint('action_log', key)
        .then(() => {
          return queryInterface.addConstraint('action_log', [`${table}_id`], {
            type: 'foreign key',
            name: key,
            references: {
              table: table === 'performing_user' ? 'user' : table,
              field: 'id'
            },
            onDelete: 'no action',
            onUpdate: 'no action'
        })
      });
    }));
  }
};
