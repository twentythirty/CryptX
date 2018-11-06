'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_cold_storage_account_storage_fees (
      id, 
      creation_timestamp,
      amount,
      asset,
      cold_storage_account_id,
      custodian,
      strategy_type
    ) AS (
      SELECT
          fees.id,
          fees.creation_timestamp,
          fees.amount,
          asset.symbol AS asset,
          fees.cold_storage_account_id,
          custodian.name AS custodian,
          CONCAT('investment.strategy.', account.strategy_type) AS strategy_type
      FROM cold_storage_account_storage_fee AS fees
      JOIN cold_storage_account AS account on fees.cold_storage_account_id = account.id
      JOIN asset ON account.asset_id = asset.id
      JOIN cold_storage_custodian AS custodian ON account.cold_storage_custodian_id = custodian.id
    )
    `)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_cold_storage_account_storage_fees');
  }
};