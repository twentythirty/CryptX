'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('recipe_order', 'spend_amount', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    }).then(result => {
      // query below calculates spend_amount for already existing orders
      // it finds market data just before recipe order was created,
      // if for some reason doesn't find market data before that time,
      // it will take latest current price. 
      // spend_amount = quantity * market price
      return queryInterface.sequelize.query(`
        UPDATE recipe_order SET spend_amount=(
          CASE WHEN recipe_order.side=${ORDER_SIDES.Buy}
          THEN (ro.quantity * imd.ask_price)
          ELSE (ro.quantity * imd.bid_price)
          END
        )
        FROM recipe_order ro
        JOIN recipe_order_group rog ON rog.id=ro.recipe_order_group_id
        JOIN instrument_market_data imd ON imd.id=(
          SELECT MIN(imd_before.id)
          FROM (VALUES (rog.created_timestamp), (NOW()) ) as before_time (timestamp)
          JOIN instrument_market_data imd_before ON imd_before.id=(
            SELECT id
              FROM instrument_market_data
            WHERE instrument_id=ro.instrument_id
              AND exchange_id=ro.target_exchange_id
              AND timestamp < before_time.timestamp
            ORDER BY instrument_id NULLS LAST,
              exchange_id NULLS LAST,
              timestamp DESC NULLS LAST
            LIMIT 1
          )
        )
        WHERE ro.id=recipe_order.id        
      `)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.remove('recipe_order', 'spend_amount');
  }
};

