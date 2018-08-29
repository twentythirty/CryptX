'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW av_cold_storage_accounts`).then(done => {
      
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
         csa.id,
         asset.symbol AS asset,
         concat('investment.strategy.', csa.strategy_type) AS strategy_type,
         csa.address,
         csc.name AS custodian,
         COALESCE(cst.balance, 0) AS balance,
         
         COALESCE(
                            (SELECT COALESCE((ask_price + bid_price) / 2 * cst.balance, 0)
                            FROM
                              (SELECT ask_price, bid_price
                                FROM instrument_market_data
                                WHERE instrument_id IN
                                    (SELECT id
                                    FROM instrument
                                    WHERE quote_asset_id = 1
                                      AND transaction_asset_id = csa.asset_id)
                                ORDER BY TIMESTAMP DESC LIMIT 1) AS prices), 0) AS balance_usd,
                cst.balance_update_timestamp AS balance_update_timestamp
          FROM cold_storage_account csa
          LEFT JOIN
            (SELECT cold_storage_account_id,
                    asset_id,
                    sum(amount) - sum(fee) AS balance,
                    max(completed_timestamp) AS balance_update_timestamp
            FROM cold_storage_transfer
            WHERE status = 94
            GROUP BY cold_storage_account_id,
                      asset_id) AS cst ON cst.cold_storage_account_id = csa.id
          AND cst.asset_id = csa.asset_id
          JOIN asset ON csa.asset_id = asset.id
          JOIN cold_storage_custodian csc ON csa.cold_storage_custodian_id = csc.id
      )
      `)
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_cold_storage_accounts').then(done => {
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
    });
  }
};