'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_instrument_liquidity_requirements (
        id,
        instrument_id,
        instrument,
        periodicity,
        quote_asset,
        minimum_circulation,
        exchange,
        exchange_count,
        exchange_pass
      ) AS
      ( SELECT
          lr.id,
          lr.instrument_id,
          i.symbol AS instrument,
          lr.periodicity_in_days AS periodicity,
          a.symbol AS quote_asset,
          lr.minimum_volume AS minimum_circulation,
          (CASE WHEN lr.exchange IS NULL THEN NULL ELSE ex.name END) AS exchange,
          (SELECT COUNT(*) FROM public.instrument_exchange_mapping AS em WHERE lr.instrument_id = em.instrument_id) AS exchange_count,
          (SELECT COUNT(*) FROM (SELECT DISTINCT ON (lh.exchange_id) lh.volume, lh.timestamp_to
            FROM public.instrument_liquidity_history AS lh
            WHERE lh.instrument_id = lr.instrument_id
            ORDER BY lh.exchange_id, lh.timestamp_to DESC
          ) AS exchange_pass WHERE exchange_pass.volume > lr.minimum_volume) AS exchange_pass
        FROM public.instrument_liquidity_requirement AS lr
        LEFT OUTER JOIN public.instrument AS i ON lr.instrument_id = i.id
        LEFT OUTER JOIN public.asset AS a ON i.quote_asset_id = a.id
        LEFT OUTER JOIN public.exchange AS ex ON lr.exchange = ex.id )
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instrument_liquidity_requirements');
  }
};
