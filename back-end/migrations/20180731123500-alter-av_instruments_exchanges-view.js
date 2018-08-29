'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instruments_exchanges').then(done => {

      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_instruments_exchanges ( 
        instrument_id, 
        exchange_id, 
        exchange_name, 
        external_instrument, 
        current_price, 
        last_day_vol, 
        last_week_vol, 
        last_updated) AS
      (SELECT iem.instrument_id AS instrument_id,
              iem.exchange_id AS exchange_id,
              ex.name AS exchange_name,
              iem.external_instrument_id AS external_instrument,
              prices.ask_price AS current_price,
              lh.volume AS last_day_volume,
    
         (SELECT SUM(volume)
          FROM instrument_liquidity_history
          WHERE exchange_id = iem.exchange_id
            AND instrument_id = iem.instrument_id
            AND timestamp_to BETWEEN (CURRENT_TIMESTAMP - interval '7 days') AND CURRENT_TIMESTAMP) AS last_week_vol,
              prices.timestamp AS last_updated
       FROM instrument_exchange_mapping AS iem
       LEFT JOIN exchange AS ex ON iem.exchange_id = ex.id
       LEFT JOIN
         (SELECT instrument_id, exchange_id, (array_agg(ask_price))[1] AS ask_price, (array_agg(bid_price))[1] AS bid_price, (array_agg(TIMESTAMP))[1] AS TIMESTAMP
          FROM
            (SELECT instrument_id,
                    exchange_id,
                    ask_price,
                    bid_price,
                    TIMESTAMP
             FROM instrument_market_data
             ORDER BY TIMESTAMP DESC) AS prices_inner
          GROUP BY instrument_id,
                   exchange_id) AS prices ON iem.exchange_id = prices.exchange_id
       AND prices.instrument_id = iem.instrument_id
       LEFT JOIN
         (SELECT instrument_id, exchange_id, (array_agg(volume))[1] AS volume
          FROM
            (SELECT instrument_id,
                    exchange_id,
                    volume
             FROM instrument_liquidity_history
             ORDER BY timestamp_from DESC) AS lh_innner
          GROUP BY instrument_id,
                   exchange_id) AS lh ON lh.instrument_id = iem.instrument_id
       AND lh.exchange_id = iem.exchange_id)
      `);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_instruments_exchanges');
  }
};