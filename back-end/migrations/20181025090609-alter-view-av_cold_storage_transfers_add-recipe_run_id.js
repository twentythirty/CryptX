'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW av_cold_storage_transfers');
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_cold_storage_transfers (
      id, 
      asset_id,
      asset,
      gross_amount,
      net_amount,
      exchange_withdrawal_fee,
      status,
      destination_account,
      custodian,
      strategy_type,
      source_exchange,
      source_account,
      placed_timestamp,
      completed_timestamp,
      recipe_run_id
    ) AS (
      SELECT
          cst.id AS id,
          a.id AS asset_id,
          a.symbol AS asset,
          cst.amount AS gross_amount,
          (cst.amount - cst.fee) AS net_amount,
          cst.fee AS exchange_withdrawal_fee,
          CONCAT('cold_storage_transfers.status.', cst.status) AS status,
          csa.address AS destination_account,
          csc.name AS custodian,
          CONCAT('investment.stategy.', csa.strategy_type) AS strategy_type,
          ex.name AS source_exchange,
          exa.address AS source_account,
          cst.placed_timestamp AS placed_timestamp,
          cst.completed_timestamp AS completed_timestamp,
          cst.recipe_run_id
      FROM cold_storage_transfer AS cst
      JOIN asset AS a ON cst.asset_id = a.id
      JOIn cold_storage_account AS csa ON cst.cold_storage_account_id = csa.id
      JOIN cold_storage_custodian AS csc ON csa.cold_storage_custodian_id = csc.id
      LEFT JOIN recipe_order AS ro ON cst.recipe_run_order_id = ro.id
      LEFT JOIN exchange AS ex ON ro.target_exchange_id = ex.id
      LEFT JOIN exchange_account AS exa ON ro.target_exchange_id = exa.exchange_id AND cst.asset_id = exa.asset_id
    )
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW av_cold_storage_transfers');
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_cold_storage_transfers (
      id, 
      asset_id,
      asset,
      gross_amount,
      net_amount,
      exchange_withdrawal_fee,
      status,
      destination_account,
      custodian,
      strategy_type,
      source_exchange,
      source_account,
      placed_timestamp,
      completed_timestamp
    ) AS (
      SELECT
          cst.id AS id,
          a.id AS asset_id,
          a.symbol AS asset,
          cst.amount AS gross_amount,
          (cst.amount - cst.fee) AS net_amount,
          cst.fee AS exchange_withdrawal_fee,
          CONCAT('cold_storage_transfers.status.', cst.status) AS status,
          csa.address AS destination_account,
          csc.name AS custodian,
          CONCAT('investment.stategy.', csa.strategy_type) AS strategy_type,
          ex.name AS source_exchange,
          exa.address AS source_account,
          cst.placed_timestamp AS placed_timestamp,
          cst.completed_timestamp AS completed_timestamp
      FROM cold_storage_transfer AS cst
      JOIN asset AS a ON cst.asset_id = a.id
      JOIn cold_storage_account AS csa ON cst.cold_storage_account_id = csa.id
      JOIN cold_storage_custodian AS csc ON csa.cold_storage_custodian_id = csc.id
      LEFT JOIN recipe_order AS ro ON cst.recipe_run_order_id = ro.id
      LEFT JOIN exchange AS ex ON ro.target_exchange_id = ex.id
      LEFT JOIN exchange_account AS exa ON ro.target_exchange_id = exa.exchange_id AND cst.asset_id = exa.asset_id
    )
    `)
  }
};