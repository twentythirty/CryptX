'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS av_liquidity_requirement_exchanges').then(done => {

      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_liquidity_requirement_exchanges ( 
          id,
          liquidity_requirement_id,
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
        (
          SELECT
            day_vol.id as id,
            ilr.id AS liquidity_requirement_id,
            e.id AS exchange_id,
            e.name AS exchange,
            i.id as instrument_id,
            i.symbol AS instrument,
            iem.external_instrument_id AS instrument_identifier,
            price.ask_price AS current_price,
            day_vol.quote_volume AS last_day_vol,
            week_vol.quote_volume AS last_week_vol,
            day_vol.timestamp as last_updated,
            requirement.passes AS passes
          FROM instrument_liquidity_requirement ilr
          JOIN instrument i ON i.id=ilr.instrument_id
          LEFT JOIN instrument_exchange_mapping iem ON iem.instrument_id=i.id AND (
            iem.exchange_id=ilr.exchange OR ilr.exchange IS NULL
          )
          LEFT JOIN exchange e ON e.id=iem.exchange_id
          LEFT JOIN LATERAL (
            SELECT ask_price
            FROM instrument_market_data imd
            WHERE imd.instrument_id = iem.instrument_id
              AND iem.exchange_id = imd.exchange_id
            ORDER BY imd.instrument_id NULLS LAST, imd.exchange_id NULLS LAST, imd.timestamp DESC NULLS LAST
            LIMIT 1
          ) AS price ON TRUE
          LEFT JOIN LATERAL (
            SELECT id, quote_volume as quote_volume, timestamp_to as timestamp
            FROM instrument_liquidity_history 
            WHERE instrument_id=i.id
              AND exchange_id=e.id
              AND timestamp_to >= NOW() - interval '1 day'
            ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp_to DESC NULLS LAST
            LIMIT 1
          ) AS day_vol ON TRUE
          LEFT JOIN LATERAL (
            SELECT AVG(quote_volume) AS quote_volume
            FROM instrument_liquidity_history ilh
            WHERE instrument_id=i.id
              AND exchange_id=e.id
              AND timestamp_to >= NOW() - interval '7 days'
            GROUP BY instrument_id, exchange_id
          ) AS week_vol ON TRUE
          LEFT JOIN LATERAL (
            SELECT 
              CASE 
                WHEN COALESCE(AVG(quote_volume), 0) > ilr.minimum_volume
                THEN 'liquidity_exchanges.status.meets_liquidity_requirements'
                ELSE 'liquidity_exchanges.status.lacking'
              END AS passes
            FROM instrument_liquidity_history ilh
            WHERE instrument_id=i.id
              AND exchange_id=e.id
              AND timestamp_to >= NOW() - interval '1 day' * ilr.periodicity_in_days
            GROUP BY instrument_id, exchange_id
          ) AS requirement ON TRUE
        )
      `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS av_liquidity_requirement_exchanges').then(done => {

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
    });
  }
};