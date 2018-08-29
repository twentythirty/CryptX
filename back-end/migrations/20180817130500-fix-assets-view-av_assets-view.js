'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_assets`).then(() => {
			
			return queryInterface.sequelize.query(`
			CREATE OR REPLACE VIEW av_assets (id, symbol, is_cryptocurrency, long_name, is_base, is_deposit, capitalization, nvt_ratio, market_share, capitalization_updated, status) AS
			(
				SELECT *
				FROM (
					(
						SELECT a.id AS id,
						a.symbol AS symbol,
						'assets.is_cryptocurrency.no' AS is_cryptocurrency,
						a.long_name AS long_name,
						'assets.is_base.no' AS is_base,
						'assets.is_deposit.yes' AS is_deposit,
						NULL AS capitalization,
								NULL AS nvt_ratio,
										NULL AS market_share,
												NULL AS capitalization_updated,
														'assets.status.400' AS status
						FROM asset a
						WHERE a.symbol = 'USD'
					)
					UNION
					(
						SELECT a.id AS id,
						a.symbol AS symbol,
						(CASE WHEN a.is_base = FALSE
						AND a.is_deposit = TRUE THEN 'assets.is_cryptocurrency.no' ELSE 'assets.is_cryptocurrency.yes' END) AS is_cryptocurrency,
						a.long_name AS long_name,
						(CASE WHEN a.is_base THEN 'assets.is_base.yes' ELSE 'assets.is_base.no' END) AS is_base,
						(CASE WHEN a.is_deposit THEN 'assets.is_deposit.yes' ELSE 'assets.is_deposit.no' END) AS is_deposit,
						grouped_cap.capitalization_usd AS capitalization,
						grouped_nvt.value AS nvt_ratio,
						grouped_cap.market_share_percentage AS market_share,
						grouped_cap.timestamp AS capitalization_updated,
						CONCAT('assets.status.', COALESCE(grouped_status.type, '400')) AS status

						FROM asset a
						JOIN
						(
							SELECT DISTINCT ON (asset_id) asset_id, TIMESTAMP, capitalization_usd, market_share_percentage
							FROM asset_market_capitalization
							ORDER BY asset_id, timestamp DESC
						) AS grouped_cap ON grouped_cap.asset_id = a.id
						LEFT JOIN
						(
							SELECT DISTINCT ON (asset_id) asset_id, TIMESTAMP, TYPE
							FROM asset_status_change
							ORDER BY asset_id, timestamp DESC
						) AS grouped_status ON grouped_status.asset_id = a.id
						LEFT JOIN
						(
							SELECT DISTINCT ON (asset_id) asset_id, TYPE, value, TIMESTAMP
							FROM market_history_calculation
							ORDER BY asset_id, timestamp DESC
						) AS grouped_nvt ON grouped_nvt.asset_id = a.id
					)
				) AS all_data
				ORDER BY id ASC
			)
			`);
		})
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_assets`).then(() => {
			return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW av_assets (id, symbol, is_cryptocurrency, long_name, is_base, is_deposit, capitalization, nvt_ratio, market_share, capitalization_updated, status) AS
			(SELECT *
			 FROM (
					 (SELECT a.id AS id,
							 a.symbol AS symbol,
							 'assets.is_cryptocurrency.no' AS is_cryptocurrency,
							 a.long_name AS long_name,
							 'assets.is_base.no' AS is_base,
							 'assets.is_deposit.yes' AS is_deposit,
							 NULL AS capitalization,
									 NULL AS nvt_ratio,
											 NULL AS market_share,
													 NULL AS capitalization_updated,
															 'assets.status.400' AS status
					  FROM asset a
					  WHERE a.symbol = 'USD')
				   UNION
					 (SELECT a.id AS id,
							 a.symbol AS symbol,
							 (CASE WHEN a.is_base = FALSE
							  AND a.is_deposit = TRUE THEN 'assets.is_cryptocurrency.no' ELSE 'assets.is_cryptocurrency.yes' END) AS is_cryptocurrency,
							 a.long_name AS long_name,
							 (CASE WHEN a.is_base THEN 'assets.is_base.yes' ELSE 'assets.is_base.no' END) AS is_base,
							 (CASE WHEN a.is_deposit THEN 'assets.is_deposit.yes' ELSE 'assets.is_deposit.no' END) AS is_deposit,
							 grouped_cap.capitalization_usd AS capitalization,
							 grouped_nvt.value AS nvt_ratio,
							 grouped_cap.market_share_percentage AS market_share,
							 grouped_cap.timestamp AS capitalization_updated,
							 CONCAT('assets.status.', COALESCE(grouped_status.type, '400')) AS status
					  FROM asset a
					  JOIN
						(SELECT asset_id, (array_agg(TIMESTAMP))[1] AS TIMESTAMP, (array_agg(capitalization_usd))[1] AS capitalization_usd, (array_agg(market_share_percentage))[1] AS market_share_percentage
						 FROM
						   (SELECT asset_id,
								   TIMESTAMP,
								   capitalization_usd,
								   market_share_percentage
							FROM asset_market_capitalization
							ORDER BY TIMESTAMP DESC) AS amc_inner
						 GROUP BY amc_inner.asset_id) AS grouped_cap ON grouped_cap.asset_id = a.id
					  LEFT JOIN
						(SELECT asset_id, (array_agg(TIMESTAMP))[1] AS TIMESTAMP, (array_agg(TYPE))[1] AS TYPE
						 FROM
						   (SELECT asset_id,
								   TIMESTAMP,
								   TYPE
							FROM asset_status_change
							ORDER BY TIMESTAMP DESC) AS asc_inner
						 GROUP BY asc_inner.asset_id) AS grouped_status ON grouped_status.asset_id = a.id
					  LEFT JOIN
						(SELECT asset_id, (array_agg(TYPE))[1] AS TYPE, (array_agg(value))[1] AS value, (array_agg(TIMESTAMP))[1] AS TIMESTAMP
						 FROM
						   (SELECT asset_id,
								   TYPE,
								   value,
								   TIMESTAMP
							FROM market_history_calculation
							ORDER BY TIMESTAMP DESC) AS mhc_inner
						 GROUP BY mhc_inner.asset_id) AS grouped_nvt ON grouped_nvt.asset_id = a.id)) AS all_data
			 ORDER BY id ASC)`);
		});
	}
};