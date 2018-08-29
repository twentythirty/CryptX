'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_instruments AS
        ( SELECT inst.id,
            inst.symbol,
            count(DISTINCT inst_map.exchange_id) AS exchanges_connected,
            GREATEST(((SELECT count(*) FROM exchange) - count(DISTINCT inst_map.exchange_id)), 0) AS exchanges_failed
        FROM instrument AS inst
        LEFT OUTER JOIN instrument_exchange_mapping AS inst_map ON inst.id = inst_map.instrument_id
        GROUP BY inst.id,
            inst.symbol );
        `);
    },
    down: (queryInterface, Sequelize) => {
        //Replaces it with the old migration query
        return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_instruments ( id, symbol, exchanges_connected, exchanges_failed) AS
        ( SELECT inst.id,
                 inst.symbol,
                 count(DISTINCT inst_map.exchange_id) AS exchanges_connected,
                 (
                    (SELECT count(*)
                     FROM exchange) - count(DISTINCT inst_map.exchange_id)) AS exchanges_failed
         FROM instrument AS inst
         JOIN instrument_exchange_mapping AS inst_map ON inst.id = inst_map.instrument_id
         GROUP BY inst.id,
                  inst.symbol );`);
    }
};