'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS instrument_market_data_timestamp
    `).then(()=> {
      return queryInterface.sequelize.query(`
        CREATE INDEX imd_instrument_exchange_timestamp_idx
        ON instrument_market_data
        (instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST)
      `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS imd_instrument_exchange_timestamp_idx
    `).then(() => {
      return queryInterface.sequelize.query(`
        CREATE INDEX instrument_market_data_timestamp
        ON instrument_market_data
        (timestamp DESC NULLS LAST)
      `)
    });
  }
};
