'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_exchange_credentials (id, exchange_id, exchange, username) AS
      (
        SELECT
            ec.id,
            ex.id AS exchange_id,
            ex.name AS exchange,
            ec.api_user_id AS username
        FROM exchange_credential AS ec
        JOIn exchange AS ex ON ec.exchange_id = ex.id
      )
    `);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.query(`DROP VIEW IF EXISTS av_exchange_credentials`);
	}
};