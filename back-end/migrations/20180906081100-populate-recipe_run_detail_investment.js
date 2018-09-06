'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
        INSERT INTO recipe_run_detail_investment (recipe_run_detail_id, asset_id, amount)
          (
            SELECT rrd.id, asset.id, (rrd.investment_percentage / 100) * ir.deposit_usd as amount
            FROM recipe_run_detail rrd
            JOIN recipe_run rr ON rr.id=rrd.recipe_run_id
            JOIN investment_run ir ON ir.id=rr.investment_run_id
            JOIN asset ON asset.symbol = 'USD'
          );
      `)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('DELETE FROM recipe_run_detail_investment');
  }
};