'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_instruments`).then(done => {
            return queryInterface.sequelize.query(`
            CREATE OR REPLACE VIEW av_instruments AS
            ( 
                SELECT i.id,
                    i.symbol,
                    md.timestamp,
                    count(case when md.timestamp >= NOW() - interval '15 minutes' then 1 else null end) as exchanges_connected,
                    count(case when md.timestamp < NOW() - interval '15 minutes' OR md.timestamp IS NULL then 1 else null end) as exchanges_failed
                FROM instrument as i
                LEFT JOIN instrument_exchange_mapping as iem ON iem.instrument_id=i.id
                LEFT JOIN (
                    SELECT MAX(imd.timestamp) AS timestamp, imd.exchange_id, imd.instrument_id
                    FROM instrument_market_data as imd
                    GROUP BY imd.exchange_id, imd.instrument_id
                ) as md ON md.instrument_id=i.id AND md.exchange_id=iem.exchange_id
                GROUP BY i.id, i.symbol, md.timestamp
            )
            `);
        })
    },
    down: (queryInterface, Sequelize) => {
        //Replaces it with the old migration query
        return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_instruments`).then(done => {
            return queryInterface.sequelize.query(`
            CREATE OR REPLACE VIEW av_instruments AS
            ( SELECT i.id,
                i.symbol,
                count(case when md.timestamp >= NOW() - interval '15 minutes' then 1 else null end) as exchanges_connected,
                count(case when md.timestamp < NOW() - interval '15 minutes' then 1 else null end) as exchanges_failed
            FROM instrument as i
            LEFT JOIN instrument_exchange_mapping as iem ON iem.instrument_id=i.id
            LEFT JOIN (
                SELECT MAX(imd.timestamp) AS timestamp, imd.exchange_id, imd.instrument_id
                FROM instrument_market_data imd
                GROUP BY imd.exchange_id, imd.instrument_id
            ) as md ON md.instrument_id=i.id AND md.exchange_id=iem.exchange_id
            GROUP BY i.id, i.symbol )`);
        });
    }
};