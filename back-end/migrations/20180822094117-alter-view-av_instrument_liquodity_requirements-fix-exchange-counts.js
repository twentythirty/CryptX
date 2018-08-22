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
          CASE
            WHEN( lr.exchange IS NULL )
            THEN 'instrument_liquidity_requirements.all'
            ELSE ex.name
        END AS exchange,
          ( SELECT count( * ) AS count FROM instrument_exchange_mapping em WHERE CASE
            WHEN( lr.exchange IS NULL )
            THEN( em.instrument_id = lr.instrument_id )
            ELSE( em.instrument_id = lr.instrument_id AND em.exchange_id = ex.id )
        END ) AS exchange_count,
          ( SELECT count( * ) AS count FROM ( SELECT DISTINCT ON( lh.exchange_id ) lh.volume,lh.timestamp_to FROM instrument_liquidity_history lh 
        JOIN instrument_exchange_mapping em ON lh.exchange_id = em.exchange_id AND lh.instrument_id = em.instrument_id
        WHERE CASE
            WHEN( lr.exchange IS NULL )
            THEN( lh.instrument_id = lr.instrument_id )
            ELSE( lh.instrument_id = lr.instrument_id AND lh.exchange_id = ex.id )
        END ORDER BY lh.exchange_id,lh.timestamp_to DESC ) exchange_pass WHERE( exchange_pass.volume > lr.minimum_volume ) ) AS exchange_pass
        FROM ( ( ( instrument_liquidity_requirement lr
        LEFT JOIN instrument i ON ( ( lr.instrument_id = i.id ) ) )
        LEFT JOIN asset a ON ( ( i.quote_asset_id = a.id ) ) )
        LEFT JOIN exchange ex ON ( ( lr.exchange = ex.id ) ) )
      )
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instrument_liquidity_requirements');
  }
};
