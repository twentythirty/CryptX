'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS av_instruments_exchanges').then(done => {

      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_instruments_exchanges ( 
        instrument_id, 
        exchange_id, 
        exchange_name, 
        external_instrument, 
        current_price, 
        last_day_vol, 
        last_week_vol, 
        last_updated) AS
      (
        SELECT iem.instrument_id AS instrument_id,
          iem.exchange_id AS exchange_id,
          ex.name AS exchange_name,
          iem.external_instrument_id AS external_instrument,
          prices.ask_price AS current_price,
          lh.volume AS last_day_volume,
          (
            SELECT SUM(volume)
            FROM instrument_liquidity_history
            WHERE exchange_id = iem.exchange_id AND instrument_id = iem.instrument_id 
              AND timestamp_to BETWEEN (CURRENT_TIMESTAMP - interval '7 days') AND CURRENT_TIMESTAMP
          ) AS last_week_vol,
          prices.timestamp AS last_updated
              
        FROM instrument_exchange_mapping AS iem
        LEFT JOIN exchange AS ex ON iem.exchange_id = ex.id
        LEFT JOIN LATERAL
          (
            SELECT instrument_id, exchange_id, timestamp, ask_price, bid_price
            FROM instrument_market_data imd
            WHERE imd.instrument_id = iem.instrument_id AND iem.exchange_id = imd.exchange_id
            ORDER BY imd.instrument_id NULLS LAST, imd.exchange_id NULLS LAST, imd.timestamp DESC NULLS LAST
            LIMIT 1
          ) AS prices ON TRUE
        LEFT JOIN LATERAL
          (
            SELECT instrument_id, exchange_id, volume, timestamp_from
            FROM instrument_liquidity_history ilh
            WHERE ilh.instrument_id=iem.instrument_id AND ilh.exchange_id=iem.exchange_id
            ORDER BY ilh.instrument_id NULLS LAST, ilh.exchange_id NULLS LAST, ilh.timestamp_from DESC NULLS LAST
            LIMIT 1
          ) AS lh ON TRUE
      )
      `);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW IF EXIST av_instruments_exchanges')
    .then(() => {
      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_instruments_exchanges ( 
        instrument_id, 
        exchange_id, 
        exchange_name, 
        external_instrument, 
        current_price, 
        last_day_vol, 
        last_week_vol, 
        last_updated) AS
      (
        SELECT iem.instrument_id AS instrument_id,
          iem.exchange_id AS exchange_id,
          ex.name AS exchange_name,
          iem.external_instrument_id AS external_instrument,
          prices.ask_price AS current_price,
          lh.volume AS last_day_volume,
          (
            SELECT SUM(volume)
            FROM instrument_liquidity_history
            WHERE exchange_id = iem.exchange_id
              AND instrument_id = iem.instrument_id
              AND timestamp_to BETWEEN (CURRENT_TIMESTAMP - interval '7 days') AND CURRENT_TIMESTAMP
          ) AS last_week_vol,
          prices.timestamp AS last_updated
              
        FROM instrument_exchange_mapping AS iem
        LEFT JOIN exchange AS ex ON iem.exchange_id = ex.id
        LEFT JOIN
          (
            SELECT DISTINCT ON (instrument_id, exchange_id) instrument_id, exchange_id, timestamp, ask_price, bid_price
            FROM instrument_market_data
            ORDER BY instrument_id, exchange_id, timestamp DESC
          ) AS prices ON iem.exchange_id = prices.exchange_id AND prices.instrument_id = iem.instrument_id
        LEFT JOIN
          (
            SELECT DISTINCT ON (instrument_id, exchange_id) instrument_id, exchange_id, volume, timestamp_from
            FROM instrument_liquidity_history
            ORDER BY instrument_id, exchange_id, timestamp_from DESC
          ) AS lh ON lh.instrument_id = iem.instrument_id AND lh.exchange_id = iem.exchange_id
       `)
    });
  }
};