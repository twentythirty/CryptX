'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_group_assets (id, symbol, long_name, capitalization, nvt_ratio, market_share, status, comment) AS
      (
        WITH group_assets AS (
          SELECT 
              ga.asset_id as id,
              ga.status,
              ga.investment_run_asset_group_id,
              a.symbol,
              a.long_name
          FROM group_asset AS ga
          JOIN investment_run_asset_group AS irag ON irag.id = ga.investment_run_asset_group_id
          JOIN asset AS a On a.id = ga.asset_id
      )
        SELECT all_data.id,
          all_data.symbol,
          all_data.long_name,
          all_data.capitalization,
          all_data.nvt_ratio,
          all_data.market_share,
          all_data.status,
          all_data.comment,
          all_data.investment_run_asset_group_id
        FROM ( SELECT a.id,
                  a.symbol,
                  a.long_name,
                  a.investment_run_asset_group_id,
                  grouped_cap.capitalization_usd AS capitalization,
                  grouped_nvt.value AS nvt_ratio,
                  grouped_cap.market_share_percentage AS market_share,
                  grouped_cap."timestamp" AS capitalization_updated,
                  concat('assets.status.', COALESCE(a.status, '400'::smallint)) AS status,
                  grouped_status.comment
                FROM (((group_assets a
                  JOIN LATERAL ( SELECT amc.asset_id,
                          amc."timestamp",
                          amc.capitalization_usd,
                          amc.market_share_percentage
                        FROM asset_market_capitalization amc
                        WHERE (amc.asset_id = a.id)
                        ORDER BY amc.asset_id, amc."timestamp" DESC NULLS LAST
                      LIMIT 1) grouped_cap ON (true))
                  LEFT JOIN ( SELECT DISTINCT ON(asset_status_change.asset_id, asset_status_change.type) asset_status_change.asset_id,
                          asset_status_change."timestamp",
                          asset_status_change.type,
                          asset_status_change.comment
                        FROM asset_status_change
                        ORDER BY asset_status_change.asset_id, asset_status_change.type, asset_status_change."timestamp" DESC) grouped_status ON ((grouped_status.asset_id = a.id AND grouped_status.type = a.status)))
                  LEFT JOIN LATERAL ( SELECT mhc.asset_id,
                          mhc.type,
                          mhc.value,
                          mhc."timestamp"
                        FROM market_history_calculation mhc
                        WHERE (mhc.asset_id = a.id)
                        ORDER BY mhc.asset_id, mhc."timestamp" DESC NULLS LAST
                      LIMIT 1) grouped_nvt ON (true))) all_data
      )
    `);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_group_assets`);
	}
};