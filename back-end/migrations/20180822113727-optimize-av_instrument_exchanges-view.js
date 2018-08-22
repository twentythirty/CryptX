'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
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
    ( WITH newest_prices AS (
      SELECT DISTINCT ON(imd.exchange_id, imd.instrument_id) imd.exchange_id, imd.instrument_id, imd.timestamp, imd.ask_price
      FROM instrument_market_data AS imd
      ORDER BY imd.exchange_id, imd.instrument_id, imd."timestamp" DESC
    )
    SELECT DISTINCT ON (lh.exchange_id)
        lh.instrument_id,
        lh.exchange_id,
        ex.name AS exchange_name,
        exm.external_instrument_id AS instrument_identifier,
        (SELECT np.ask_price FROM newest_prices AS np WHERE lh.exchange_id = np.exchange_id AND lh.instrument_id = np.instrument_id) AS current_price,
        lh.volume AS last_day_vol,
        ( SELECT sum(last_week.volume) AS sum
              FROM ( SELECT instrument_liquidity_history.volume
                      FROM instrument_liquidity_history
                      WHERE (lh.exchange_id = instrument_liquidity_history.exchange_id)
                      ORDER BY instrument_liquidity_history.timestamp_to DESC
                    LIMIT 7) last_week) AS last_week_vol,
        lh.timestamp_to AS last_updated,
            CASE
                WHEN (lh.volume > lr.minimum_volume) THEN 'liquidity_exchanges.status.meets_liquidity_requirements'::text
                ELSE 'liquidity_exchanges.status.lacking'::text
            END AS passes
      FROM ((((instrument_liquidity_history lh
        LEFT JOIN exchange ex ON ((lh.exchange_id = ex.id)))
        LEFT JOIN instrument_exchange_mapping exm ON (((lh.exchange_id = exm.exchange_id) AND (lh.instrument_id = exm.instrument_id))))
        LEFT JOIN instrument i ON ((lh.instrument_id = i.id)))
        LEFT JOIN instrument_liquidity_requirement lr ON ((lh.instrument_id = lr.instrument_id)))
      ORDER BY lh.exchange_id, lh.timestamp_to DESC)
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instruments_exchanges');
  }
};