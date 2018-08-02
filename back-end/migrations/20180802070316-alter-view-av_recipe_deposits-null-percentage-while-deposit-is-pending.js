'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_recipe_deposits (id, recipe_run_id, investment_run_id, quote_asset_id, quote_asset, exchange_id, exchange, account, amount, investment_percentage, status) AS
    (SELECT 
        dep.id,
        dep.recipe_run_id,
        ir.id AS investment_run_id,
        dep.asset_id AS quote_asset,
        a.symbol AS quote_asset,
        ex.id AS exchange_id,
        ex.name AS exchange,
        exa.address AS account,
        dep.amount,
        (CASE WHEN dep.status=${MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Completed} THEN (SELECT SUM(rrd.investment_percentage) FROM recipe_run_detail AS rrd WHERE dep.recipe_run_id = rrd.recipe_run_id AND dep.asset_id = rrd.quote_asset_id AND exa.exchange_id = rrd.target_exchange_id) ELSE NULL END) AS investment_percentage,
        CONCAT('deposits.status.', dep.status) AS status
    FROM recipe_run_deposit AS dep
    JOIN recipe_run AS rr ON dep.recipe_run_id = rr.id
    JOIN investment_run AS ir ON rr.investment_run_id = ir.id
    JOIN asset AS a ON dep.asset_id = a.id
    JOIN exchange_account AS exa ON dep.target_exchange_account_id = exa.id
    JOIN exchange AS ex ON exa.exchange_id = ex.id )
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_deposits');
  }
};