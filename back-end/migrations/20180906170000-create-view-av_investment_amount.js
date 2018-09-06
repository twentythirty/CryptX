'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_investment_amount (
          id,
          investment_run_id,
          currency_name,
          currency_symbol,
          amount,
          value_usd
        ) AS
        ( SELECT ia.id as id,
            ir.id as investment_run_id,
            a.long_name as currency_name,
            a.symbol as currency_symbol,
            ia.amount,
            CASE WHEN a.symbol='USD' THEN ia.amount ELSE ia.amount * value_usd END as value_usd
          FROM investment_run ir
          JOIN investment_amount ia ON ia.investment_run_id=ir.id
          JOIN asset a ON a.id=ia.asset_id
          LEFT JOIN LATERAL ( -- calculates average price of asset through instruments
            SELECT i.id, AVG (prices.ask_price) as value_usd
            FROM instrument i
            JOIN instrument_exchange_mapping iem ON iem.instrument_id=i.id
            JOIN asset quote_asset ON quote_asset.id=i.quote_asset_id
            LEFT JOIN LATERAL ( -- gets newest prices of asset
              SELECT imd.ask_price
              FROM instrument_market_data imd
              WHERE imd.instrument_id=iem.instrument_id
              ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
              LIMIT 1
            ) as prices ON TRUE
            WHERE transaction_asset_id=a.id
              AND ( quote_asset.symbol='USD' OR quote_asset.symbol='USDT')
            GROUP BY i.id
          ) as value_usd ON TRUE
        )
      `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_investment_amount');
  }
};