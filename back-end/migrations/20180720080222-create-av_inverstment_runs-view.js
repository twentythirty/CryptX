'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_investment_runs (
        id,
        started_timestamp,
        updated_timestamp,
        completed_timestamp,
        strategy_type,
        is_simulated,
        status,
        user_created
      ) AS
      ( SELECT 
        ir.id,
        ir.started_timestamp,
        ir.updated_timestamp,
        ir.completed_timestamp,
        ir.strategy_type,
        ir.is_simulated,
        ir.status,
        concat(u.first_name, ' ', u.last_name) AS user_created
      FROM public.investment_run AS ir
      INNER JOIN public.user AS u ON ir.user_created_id = u.id )
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_investment_runs');
  }
};
