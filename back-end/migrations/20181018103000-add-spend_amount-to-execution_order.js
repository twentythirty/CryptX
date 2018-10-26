'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('execution_order', 'spend_amount', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    }).then(result => {
      // query below calculates spend_amount for already existing orders
      // it finds market data just before execution order was created,
      // if for some reason doesn't find market data before that time,
      // it will take latest current price. 
      // spend_amount = quantity * market price
      return queryInterface.sequelize.query(`
        UPDATE execution_order SET spend_amount=(
          CASE WHEN eo.side=${ORDER_SIDES.Buy}
          THEN (eo.total_quantity * imd.ask_price)
          ELSE (eo.total_quantity * imd.bid_price)
          END
        )
        FROM execution_order eo
        JOIN instrument_market_data imd ON imd.id=(
          SELECT MIN(imd_before.id)
          FROM (VALUES (eo.placed_timestamp), (NOW()) ) as before_time (timestamp)
          JOIN instrument_market_data imd_before ON imd_before.id=(
          SELECT id
            FROM instrument_market_data
          WHERE instrument_id=eo.instrument_id
            AND exchange_id=eo.exchange_id
            AND timestamp < before_time.timestamp
          ORDER BY instrument_id NULLS LAST,
            exchange_id NULLS LAST,
            timestamp DESC NULLS LAST
          LIMIT 1
          )
        )
        WHERE eo.id=execution_order.id
      `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.remove('execution_order', 'spend_amount');
  }
};

