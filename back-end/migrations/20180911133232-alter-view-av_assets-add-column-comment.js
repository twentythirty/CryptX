'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_assets`).then(() => {
			
			return queryInterface.sequelize.query(`
			CREATE OR REPLACE VIEW av_assets (id, symbol, is_cryptocurrency, long_name, is_base, is_deposit, capitalization, nvt_ratio, market_share, capitalization_updated, status, comment) AS
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
                            'assets.status.400' AS status,
                                NULL AS "comment"
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
            CONCAT('assets.status.', COALESCE(grouped_status.type, '400')) AS status,
            grouped_status.comment

						FROM asset a
						JOIN LATERAL
						(
							SELECT amc.asset_id, amc.TIMESTAMP, amc.capitalization_usd, amc.market_share_percentage
							FROM asset_market_capitalization amc
							WHERE amc.asset_id=a.id
							ORDER BY asset_id, timestamp DESC NULLS LAST
							LIMIT 1
						) grouped_cap ON TRUE
						LEFT JOIN
						(
							SELECT DISTINCT ON (asset_id) asset_id, TIMESTAMP, TYPE, comment
							FROM asset_status_change
							ORDER BY asset_id, timestamp DESC
						) AS grouped_status ON grouped_status.asset_id = a.id
						LEFT JOIN LATERAL
						(
							SELECT mhc.asset_id, mhc.TYPE, mhc.value, mhc.TIMESTAMP
							FROM market_history_calculation mhc
							WHERE mhc.asset_id=a.id
							ORDER BY asset_id NULLS LAST, timestamp DESC NULLS LAST
							LIMIT 1
						) AS grouped_nvt ON TRUE
					)
				) AS all_data
				ORDER BY id ASC
			)
			`);
		})
	},
	down: (queryInterface, Sequelize) => {
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
						JOIN LATERAL
						(
							SELECT amc.asset_id, amc.TIMESTAMP, amc.capitalization_usd, amc.market_share_percentage
							FROM asset_market_capitalization amc
							WHERE amc.asset_id=a.id
							ORDER BY asset_id, timestamp DESC NULLS LAST
							LIMIT 1
						) grouped_cap ON TRUE
						LEFT JOIN
						(
							SELECT DISTINCT ON (asset_id) asset_id, TIMESTAMP, TYPE
							FROM asset_status_change
							ORDER BY asset_id, timestamp DESC
						) AS grouped_status ON grouped_status.asset_id = a.id
						LEFT JOIN LATERAL
						(
							SELECT mhc.asset_id, mhc.TYPE, mhc.value, mhc.TIMESTAMP
							FROM market_history_calculation mhc
							WHERE mhc.asset_id=a.id
							ORDER BY asset_id NULLS LAST, timestamp DESC NULLS LAST
							LIMIT 1
						) AS grouped_nvt ON TRUE
					)
				) AS all_data
				ORDER BY id ASC
			)
      `);
		});
	}
};