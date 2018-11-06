'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_instruments`).then(done => {
            return queryInterface.sequelize.query(`
            CREATE OR REPLACE VIEW av_instruments AS
            ( 
                SELECT i.id,
                    i.symbol,
                    count(case when md.timestamp >= NOW() - interval '15 minutes' then 1 else null end) as exchanges_connected,
                    count(case when md.timestamp < NOW() - interval '15 minutes' OR (md.timestamp IS NULL AND iem.instrument_id IS NOT NULL) then 1 else null end) as exchanges_failed
                FROM instrument as i
                LEFT JOIN instrument_exchange_mapping as iem ON iem.instrument_id=i.id
                LEFT JOIN LATERAL (
                    SELECT imd.instrument_id, imd.exchange_id, imd.timestamp, imd.ask_price, imd.bid_price
                    FROM instrument_market_data as imd
                    WHERE imd.instrument_id=i.id AND imd.exchange_id=iem.exchange_id
                    ORDER BY imd.instrument_id NULLS LAST, imd.exchange_id NULLS LAST, imd.timestamp DESC NULLS LAST
                    LIMIT 1
                ) as md ON TRUE AND md.exchange_id IN (SELECT id FROM exchange WHERE is_mappable IS TRUE)
                GROUP BY i.id, i.symbol
            )
            `);
        })
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_instruments`).then(done => {
          return queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW av_instruments AS
          ( 
              SELECT i.id,
                  i.symbol,
                  count(case when md.timestamp >= NOW() - interval '15 minutes' then 1 else null end) as exchanges_connected,
                  count(case when md.timestamp < NOW() - interval '15 minutes' OR (md.timestamp IS NULL AND iem.instrument_id IS NOT NULL) then 1 else null end) as exchanges_failed
              FROM instrument as i
              LEFT JOIN instrument_exchange_mapping as iem ON iem.instrument_id=i.id
              LEFT JOIN LATERAL (
                  SELECT imd.instrument_id, imd.exchange_id, imd.timestamp, imd.ask_price, imd.bid_price
                  FROM instrument_market_data as imd
                  WHERE imd.instrument_id=i.id AND imd.exchange_id=iem.exchange_id
                  ORDER BY imd.instrument_id NULLS LAST, imd.exchange_id NULLS LAST, imd.timestamp DESC NULLS LAST
                  LIMIT 1
              ) as md ON TRUE
              GROUP BY i.id, i.symbol
          )
          `);
      })
    }
};