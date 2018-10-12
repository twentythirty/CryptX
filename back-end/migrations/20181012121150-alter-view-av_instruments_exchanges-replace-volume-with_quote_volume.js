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
        SELECT iem.instrument_id,
        iem.exchange_id,
        ex.name AS exchange_name,
        iem.external_instrument_id AS external_instrument,
        prices.ask_price AS current_price,
        lh.quote_volume AS last_day_vol,
        ( SELECT AVG(instrument_liquidity_history.quote_volume) AS sum
              FROM instrument_liquidity_history
              WHERE ((instrument_liquidity_history.exchange_id = iem.exchange_id) AND (instrument_liquidity_history.instrument_id = iem.instrument_id) AND ((instrument_liquidity_history.timestamp_to >= (now() - '7 days'::interval)) AND (instrument_liquidity_history.timestamp_to <= now())))) AS last_week_vol,
        prices."timestamp" AS last_updated
      FROM (((instrument_exchange_mapping iem
        LEFT JOIN exchange ex ON ((iem.exchange_id = ex.id)))
        LEFT JOIN LATERAL ( SELECT imd.instrument_id,
                imd.exchange_id,
                imd."timestamp",
                imd.ask_price,
                imd.bid_price
              FROM instrument_market_data imd
              WHERE ((imd.instrument_id = iem.instrument_id) AND (iem.exchange_id = imd.exchange_id))
              ORDER BY imd.instrument_id, imd.exchange_id, imd."timestamp" DESC NULLS LAST
            LIMIT 1) prices ON (true))
        LEFT JOIN LATERAL ( SELECT ilh.instrument_id,
                ilh.exchange_id,
                ilh.quote_volume,
                ilh.timestamp_from
              FROM instrument_liquidity_history ilh
              WHERE ((ilh.instrument_id = iem.instrument_id) AND (ilh.exchange_id = iem.exchange_id))
              ORDER BY ilh.instrument_id, ilh.exchange_id, ilh.timestamp_from DESC NULLS LAST
            LIMIT 1) lh ON (true))
      )
      `);
    })
  },

  down: (queryInterface, Sequelize) => {
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
          SELECT iem.instrument_id,
          iem.exchange_id,
          ex.name AS exchange_name,
          iem.external_instrument_id AS external_instrument,
          prices.ask_price AS current_price,
          lh.volume AS last_day_vol,
          ( SELECT AVG(instrument_liquidity_history.volume) AS sum
                FROM instrument_liquidity_history
                WHERE ((instrument_liquidity_history.exchange_id = iem.exchange_id) AND (instrument_liquidity_history.instrument_id = iem.instrument_id) AND ((instrument_liquidity_history.timestamp_to >= (now() - '7 days'::interval)) AND (instrument_liquidity_history.timestamp_to <= now())))) AS last_week_vol,
          prices."timestamp" AS last_updated
        FROM (((instrument_exchange_mapping iem
          LEFT JOIN exchange ex ON ((iem.exchange_id = ex.id)))
          LEFT JOIN LATERAL ( SELECT imd.instrument_id,
                  imd.exchange_id,
                  imd."timestamp",
                  imd.ask_price,
                  imd.bid_price
                FROM instrument_market_data imd
                WHERE ((imd.instrument_id = iem.instrument_id) AND (iem.exchange_id = imd.exchange_id))
                ORDER BY imd.instrument_id, imd.exchange_id, imd."timestamp" DESC NULLS LAST
              LIMIT 1) prices ON (true))
          LEFT JOIN LATERAL ( SELECT ilh.instrument_id,
                  ilh.exchange_id,
                  ilh.volume,
                  ilh.timestamp_from
                FROM instrument_liquidity_history ilh
                WHERE ((ilh.instrument_id = iem.instrument_id) AND (ilh.exchange_id = iem.exchange_id))
                ORDER BY ilh.instrument_id, ilh.exchange_id, ilh.timestamp_from DESC NULLS LAST
              LIMIT 1) lh ON (true))
        )
      `);
    });
  }
};