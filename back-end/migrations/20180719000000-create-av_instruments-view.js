'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
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
            inst.symbol );
        `);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query('DROP VIEW av_instruments');
    }
};