'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE execution_order_fill
      ALTER COLUMN fee_asset_id SET DATA TYPE INTEGER
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE execution_order_fill
      ALTER COLUMN fee_asset_id SET DATA TYPE SMALLINT
    `);
  }
};
