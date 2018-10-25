'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instrument_liquidity_requirements').then(() => {
      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_instrument_liquidity_requirements (
          id,
          instrument_id,
          instrument,
          periodicity,
          quote_asset,
          minimum_circulation,
          exchange_id,
          exchange,
          exchange_count,
          exchange_pass
        ) AS
        ( SELECT
            lr.id
          , lr.instrument_id
          , i.symbol AS instrument
          , lr.periodicity_in_days AS periodicity
          , a.symbol AS quote_asset
          , lr.minimum_volume AS minimum_circulation
          , ex.id AS exchange_id
          , CASE
              WHEN( lr.exchange IS NULL )
              THEN 'common.all'
              ELSE ex.name
          END AS exchange
          , ( SELECT count( * ) AS count FROM instrument_exchange_mapping em WHERE CASE
              WHEN( lr.exchange IS NULL )
              THEN( em.instrument_id = lr.instrument_id AND em.exchange_id IN (SELECT id FROM exchange WHERE is_mappable IS TRUE) )
              ELSE( em.instrument_id = lr.instrument_id AND em.exchange_id = ex.id )
          END ) AS exchange_count
          , ( SELECT count(*) FROM (
                SELECT AVG(ilh.quote_volume) AS volume, ilh.exchange_id, ilh.instrument_id FROM instrument_liquidity_history AS ilh 
                WHERE ilh.timestamp_to >= CURRENT_DATE - INTERVAL '1 day' * lr.periodicity_in_days
                GROUP BY ilh.exchange_id, ilh.instrument_id
          ) AS lh
            WHERE
                CASE
                    WHEN (lr.exchange IS NULL) 
                    THEN (lh.instrument_id = lr.instrument_id AND lh.exchange_id IN (SELECT id FROM exchange WHERE is_mappable IS TRUE) AND lh.volume >= lr.minimum_volume)
                    ELSE (lh.instrument_id = lr.instrument_id AND lh.exchange_id = ex.id AND lh.volume >= lr.minimum_volume)
                END ) AS exchange_pass
          FROM ( ( ( instrument_liquidity_requirement lr
          LEFT JOIN instrument i ON ( ( lr.instrument_id = i.id ) ) )
          LEFT JOIN asset a ON ( ( i.quote_asset_id = a.id ) ) )
          LEFT JOIN exchange ex ON ( ( lr.exchange = ex.id ) ) )
        )
    `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instrument_liquidity_requirements').then(() => {
      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_instrument_liquidity_requirements (
          id,
          instrument_id,
          instrument,
          periodicity,
          quote_asset,
          minimum_circulation,
          exchange_id,
          exchange,
          exchange_count,
          exchange_pass
        ) AS
        ( SELECT
            lr.id
          , lr.instrument_id
          , i.symbol AS instrument
          , lr.periodicity_in_days AS periodicity
          , a.symbol AS quote_asset
          , lr.minimum_volume AS minimum_circulation
          , ex.id AS exchange_id
          , CASE
              WHEN( lr.exchange IS NULL )
              THEN 'common.all'
              ELSE ex.name
          END AS exchange
          , ( SELECT count( * ) AS count FROM instrument_exchange_mapping em WHERE CASE
              WHEN( lr.exchange IS NULL )
              THEN( em.instrument_id = lr.instrument_id )
              ELSE( em.instrument_id = lr.instrument_id AND em.exchange_id = ex.id )
          END ) AS exchange_count
          , ( SELECT count(*) FROM (
                SELECT AVG(ilh.quote_volume) AS volume, ilh.exchange_id, ilh.instrument_id FROM instrument_liquidity_history AS ilh 
                WHERE ilh.timestamp_to >= CURRENT_DATE - INTERVAL '1 day' * lr.periodicity_in_days
                GROUP BY ilh.exchange_id, ilh.instrument_id
          ) AS lh
            WHERE
                CASE
                    WHEN (lr.exchange IS NULL) 
                    THEN (lh.instrument_id = lr.instrument_id AND lh.volume >= lr.minimum_volume)
                    ELSE (lh.instrument_id = lr.instrument_id AND lh.exchange_id = ex.id AND lh.volume >= lr.minimum_volume)
                END ) AS exchange_pass
          FROM ( ( ( instrument_liquidity_requirement lr
          LEFT JOIN instrument i ON ( ( lr.instrument_id = i.id ) ) )
          LEFT JOIN asset a ON ( ( i.quote_asset_id = a.id ) ) )
          LEFT JOIN exchange ex ON ( ( lr.exchange = ex.id ) ) )
        )
    `);
    });
  }
};
