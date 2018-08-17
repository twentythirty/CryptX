'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_cold_storage_accounts (
      id, 
      asset,
      strategy_type,
      address,
      custodian,
      balance,
      balance_usd,
      balance_update_timestamp
    ) AS (
      SELECT
          csa.id AS id,
          asset.symbol AS asset,
          CONCAT('investment.strategy.', csa.strategy_type) AS strategy_type,
          csa.address AS address,
          csc.name AS custodian,
          0 AS balance,
          0 AS balance_usd,
          CURRENT_TIMESTAMP AS balance_update_timestamp
      FROM cold_storage_account AS csa
      JOIN asset ON csa.asset_id = asset.id
      JOIN cold_storage_custodian AS csc ON csa.cold_storage_custodian_id = csc.id
    )
    `)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_cold_storage_accounts');
  }
};