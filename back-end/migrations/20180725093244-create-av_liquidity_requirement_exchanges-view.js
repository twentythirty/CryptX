'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_liquidity_requirement_exchanges (
        id,
        exchange_id,
        exchange,
        instrument_id,
        instrument,
        instrument_identifier,
        current_price,
        last_day_vol,
        last_week_vol,
        last_updated,
        passes
      ) AS
      ( SELECT
          DISTINCT ON (lh.exchange_id)
          lh.id,
          lh.exchange_id,
          ex.name AS exchange,
          lh.instrument_id,
          i.symbol AS instrument,
          exm.external_instrument_id AS instrument_identifier,
          (SELECT ask_price FROM public.instrument_market_data WHERE lh.exchange_id = exchange_id AND lh.instrument_id = instrument_id ORDER BY timestamp DESC LIMIT 1) AS current_price,
          lh.volume AS last_day_vol,
          (SELECT SUM(last_week.volume) FROM (
            SELECT volume FROM public.instrument_liquidity_history WHERE lh.exchange_id = exchange_id ORDER BY timestamp_to DESC LIMIT 7
          ) AS last_week) AS last_week_volume,
          lh.timestamp_to AS last_updated,
          (CASE WHEN lh.volume > lr.minimum_volume THEN TRUE ELSE FALSE END) AS passes
        FROM public.instrument_liquidity_history AS lh
        LEFT OUTER JOIN public.exchange AS ex ON lh.exchange_id = ex.id
        LEFT OUTER JOIN public.instrument_exchange_mapping AS exm ON lh.exchange_id = exm.exchange_id AND lh.instrument_id = exm.instrument_id
        LEFT OUTER JOIN public.instrument AS i ON lh.instrument_id = i.id
        LEFT OUTER JOIN public.instrument_liquidity_requirement AS lr ON lh.instrument_id = lr.instrument_id
        ORDER BY lh.exchange_id, lh.timestamp_to DESC )
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_run_details');
  }
};
