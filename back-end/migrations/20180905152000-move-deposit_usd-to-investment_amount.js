'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    let Asset = require('../models').Asset;
    return Asset.findOne({
      where: {
        symbol: 'USD'
      }
    }).then(usd_asset => { // insert new row for into investment_amount for every deposit_usd
      return queryInterface.sequelize.query(`
        INSERT INTO investment_amount (investment_run_id, asset_id, amount)
        (
          SELECT id as investment_run_id, ${usd_asset.id} as asset_id, deposit_usd as amount
          FROM investment_run
        )
      `)
    });
  },

  down: (queryInterface, Sequelize) => {
    let Asset = require('../models').Asset;
    return Asset.findOne({
      where: {
        symbol: 'USD'
      }
    }).then(usd_asset => { // insert new row for into investment_amount for every deposit_usd
      return queryInterface.sequelize.query(`
        UPDATE investment_run
        SET deposit_usd = ia.amount
        FROM investment_amount ia
        WHERE ia.investment_run_id=investment_run.id
          AND ia.asset_id=${usd_asset.id};
      `)
    });
  }
};