'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_investment_asset_conversions (id, recipe_run_id, investment_currency, investment_amount, target_currency, converted_amount, status) AS
      (
        WITH conversion_assets AS (
          SELECT * FROM asset AS a WHERE a.is_base IS TRUE OR a.is_deposit IS TRUE
        )
        SELECT
            ac.id,
            ac.recipe_run_id,
            investment_asset.symbol AS investment_currency,
            details.investment_amount,
            target_asset.symbol AS target_currency,
            ac.amount AS converted_amount,
            CONCAT('asset_conversions.status.', ac.status) AS status
        FROM investment_asset_conversion AS ac
        JOIN LATERAL (
            SELECT 
                rrd.recipe_run_id,
                SUM(rrdi.amount) AS investment_amount,
                rrdi.asset_id AS investment_asset_id,
                rrd.quote_asset_id AS target_asset_id
            FROM recipe_run_detail AS rrd
            LEFT JOIN recipe_run_detail_investment AS rrdi ON rrdi.recipe_run_detail_id = rrd.id
            GROUP BY rrd.recipe_run_id, rrdi.asset_id, rrd.quote_asset_id 
        ) AS details ON details.recipe_run_id = ac.recipe_run_id AND details.investment_asset_id = ac.investment_asset_id AND details.target_asset_id = ac.target_asset_id
        JOIN conversion_assets AS target_asset ON target_asset.id = ac.target_asset_id
        JOIN conversion_assets AS investment_asset On investment_asset.id = ac.investment_asset_id
      )
    `);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_investment_asset_conversions`);
	}
};