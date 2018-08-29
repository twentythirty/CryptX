'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE INDEX asset_market_capitalization_asset_id_timestamp
      ON asset_market_capitalization
      (asset_id NULLS LAST, timestamp DESC NULLS LAST)
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS asset_market_capitalization_asset_id_timestamp
    `);
  }
};
