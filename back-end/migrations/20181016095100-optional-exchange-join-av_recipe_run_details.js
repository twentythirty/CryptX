'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_recipe_run_details`)
      .then(result => {
        return queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW av_recipe_run_details (
            id,
            recipe_run_id,
            transaction_asset_id,
            transaction_asset,
            quote_asset_id,
            quote_asset,
            target_exchange_id,
            target_exchange,
            investment_percentage,
            investment_usd,
            investment_btc,
            investment_eth
          ) AS
          ( WITH investment_assets AS (
                SELECT * FROM asset 
                JOIN recipe_run_detail_investment AS inv ON inv.asset_id = asset.id
                WHERE asset.symbol IN('USD', 'ETH', 'BTC')
            )
            SELECT rrd.id,
                rrd.recipe_run_id,
                rrd.transaction_asset_id,
                ta.symbol AS transaction_asset,
                rrd.quote_asset_id,
                qa.symbol AS quote_asset,
                rrd.target_exchange_id,
                ex.name AS target_exchange,
                rrd.investment_percentage,
                coalesce((SELECT amount FROM investment_assets AS ia WHERE ia.recipe_run_detail_id = rrd.id AND ia.symbol = 'USD'), 0) AS investment_usd,
                coalesce((SELECT amount FROM investment_assets AS ia WHERE ia.recipe_run_detail_id = rrd.id AND ia.symbol = 'BTC'), 0) AS investment_btc,
                coalesce((SELECT amount FROM investment_assets AS ia WHERE ia.recipe_run_detail_id = rrd.id AND ia.symbol = 'ETH'), 0) AS investment_eth
            FROM recipe_run_detail AS rrd
            JOIN asset AS qa ON rrd.quote_asset_id = qa.id
            JOIN asset AS ta ON rrd.transaction_asset_id = ta.id
            LEFT JOIN exchange AS ex ON rrd.target_exchange_id = ex.id
          )
        `);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_run_details')
      .then(result => {
        return queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW av_recipe_run_details (
            id,
            recipe_run_id,
            transaction_asset_id,
            transaction_asset,
            quote_asset_id,
            quote_asset,
            target_exchange_id,
            target_exchange,
            investment_percentage
          ) AS
          ( SELECT
            rrd.id,
            rrd.recipe_run_id,
            rrd.transaction_asset_id,
            ta.symbol AS transaction_asset,
            rrd.quote_asset_id,
            qa.symbol AS quote_asset,
            rrd.target_exchange_id,
            ex.name AS target_exchange,
            rrd.investment_percentage
          FROM public.recipe_run_detail AS rrd
          JOIN public.asset AS qa ON rrd.quote_asset_id = qa.id
          JOIN public.asset AS ta ON rrd.transaction_asset_id = ta.id
          JOIN public.exchange AS ex ON rrd.target_exchange_id = ex.id );
        `);
      });
  }
};
