'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE INDEX ilh_instrument_exchange_timestamp
      ON instrument_liquidity_history
      (instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp_from DESC NULLS LAST)
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS ilh_instrument_exchange_timestamp
    `);
  }
};
