'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE INDEX market_history_calculation_asset_id_timestamp
      ON market_history_calculation
      (asset_id NULLS LAST, timestamp DESC NULLS LAST)
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS market_history_calculation_asset_id_timestamp
    `);
  }
};
