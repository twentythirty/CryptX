'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_exchange_accounts (id, exchange_id, exchange, asset_id, asset, address, is_active) AS
      (
        SELECT
            exa.id,
            ex.id AS exchange_id,
            ex.name AS exchange,
            a.id AS asset_id,
            a.symbol AS asset,
            exa.address,
            CASE
                WHEN (exa.is_active IS TRUE)
                THEN 'exchange_accounts.is_active.active'
                ELSE 'exchange_accounts.is_active.inactive'
            END AS is_active
        FROM public.exchange_account AS exa
        JOIn public.asset AS a ON a.id = exa.asset_id
        JOIN public.exchange AS ex ON ex.id = exa.exchange_id
      )
    `);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_exchange_accounts`);
	}
};