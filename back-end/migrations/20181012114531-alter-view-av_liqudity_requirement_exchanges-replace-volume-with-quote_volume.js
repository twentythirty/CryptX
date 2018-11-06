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
      passes) AS
    (  WITH newest_prices AS (
            SELECT DISTINCT ON (imd.exchange_id, imd.instrument_id) imd.exchange_id,
              imd.instrument_id,
              imd."timestamp",
              imd.ask_price
              FROM instrument_market_data imd
            ORDER BY imd.exchange_id, imd.instrument_id, imd."timestamp" DESC
          )
      SELECT DISTINCT ON (lh.exchange_id, lh.instrument_id) lh.id,
      lh.exchange_id,
      ex.name AS exchange,
      lh.instrument_id,
      i.symbol AS instrument,
      exm.external_instrument_id AS instrument_identifier,
      ( SELECT np.ask_price
              FROM newest_prices np
            WHERE ((lh.exchange_id = np.exchange_id) AND (lh.instrument_id = np.instrument_id))) AS current_price,
          CASE
              WHEN (lh.timestamp_to >= (('now'::text)::date - '1 day'::interval)) THEN lh.quote_volume
              ELSE NULL::numeric
          END AS last_day_vol,
      ( SELECT AVG(last_week.quote_volume) AS sum
              FROM ( SELECT ilh.quote_volume
                      FROM instrument_liquidity_history ilh
                    WHERE ((lh.exchange_id = ilh.exchange_id) AND (lh.instrument_id = ilh.instrument_id) AND (ilh.timestamp_to >= (('now'::text)::date - '7 days'::interval)))) last_week) AS last_week_vol,
      lh.timestamp_to AS last_updated,
          CASE
              WHEN (( SELECT AVG(last_week.quote_volume) AS sum
                  FROM ( SELECT ilh.quote_volume
                          FROM instrument_liquidity_history ilh
                        WHERE ((lh.exchange_id = ilh.exchange_id) AND (lh.instrument_id = ilh.instrument_id) AND (ilh.timestamp_to >= (('now'::text)::date - ('1 day'::interval * (lr.periodicity_in_days)::double precision))))) last_week) >= lr.minimum_volume) THEN 'liquidity_exchanges.status.meets_liquidity_requirements'::text
              ELSE 'liquidity_exchanges.status.lacking'::text
          END AS passes
      FROM ((((instrument_liquidity_history lh
        LEFT JOIN exchange ex ON ((lh.exchange_id = ex.id)))
        JOIN instrument_exchange_mapping exm ON (((lh.exchange_id = exm.exchange_id) AND (lh.instrument_id = exm.instrument_id))))
        LEFT JOIN instrument i ON ((lh.instrument_id = i.id)))
        LEFT JOIN instrument_liquidity_requirement lr ON ((lh.instrument_id = lr.instrument_id)))
      ORDER BY lh.exchange_id, lh.instrument_id, lh.timestamp_to DESC
    )
    `);
  },

  down: (queryInterface, Sequelize) => {
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
      passes) AS
    (  WITH newest_prices AS (
            SELECT DISTINCT ON (imd.exchange_id, imd.instrument_id) imd.exchange_id,
              imd.instrument_id,
              imd."timestamp",
              imd.ask_price
              FROM instrument_market_data imd
            ORDER BY imd.exchange_id, imd.instrument_id, imd."timestamp" DESC
          )
      SELECT DISTINCT ON (lh.exchange_id, lh.instrument_id) lh.id,
      lh.exchange_id,
      ex.name AS exchange,
      lh.instrument_id,
      i.symbol AS instrument,
      exm.external_instrument_id AS instrument_identifier,
      ( SELECT np.ask_price
              FROM newest_prices np
            WHERE ((lh.exchange_id = np.exchange_id) AND (lh.instrument_id = np.instrument_id))) AS current_price,
          CASE
              WHEN (lh.timestamp_to >= (('now'::text)::date - '1 day'::interval)) THEN lh.volume
              ELSE NULL::numeric
          END AS last_day_vol,
      ( SELECT AVG(last_week.volume) AS sum
              FROM ( SELECT ilh.volume
                      FROM instrument_liquidity_history ilh
                    WHERE ((lh.exchange_id = ilh.exchange_id) AND (lh.instrument_id = ilh.instrument_id) AND (ilh.timestamp_to >= (('now'::text)::date - '7 days'::interval)))) last_week) AS last_week_vol,
      lh.timestamp_to AS last_updated,
          CASE
              WHEN (( SELECT AVG(last_week.volume) AS sum
                  FROM ( SELECT ilh.volume
                          FROM instrument_liquidity_history ilh
                        WHERE ((lh.exchange_id = ilh.exchange_id) AND (lh.instrument_id = ilh.instrument_id) AND (ilh.timestamp_to >= (('now'::text)::date - ('1 day'::interval * (lr.periodicity_in_days)::double precision))))) last_week) >= lr.minimum_volume) THEN 'liquidity_exchanges.status.meets_liquidity_requirements'::text
              ELSE 'liquidity_exchanges.status.lacking'::text
          END AS passes
      FROM ((((instrument_liquidity_history lh
        LEFT JOIN exchange ex ON ((lh.exchange_id = ex.id)))
        JOIN instrument_exchange_mapping exm ON (((lh.exchange_id = exm.exchange_id) AND (lh.instrument_id = exm.instrument_id))))
        LEFT JOIN instrument i ON ((lh.instrument_id = i.id)))
        LEFT JOIN instrument_liquidity_requirement lr ON ((lh.instrument_id = lr.instrument_id)))
      ORDER BY lh.exchange_id, lh.instrument_id, lh.timestamp_to DESC
    )
    `);
  }
};