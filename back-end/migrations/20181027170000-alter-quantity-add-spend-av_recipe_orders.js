'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_orders').then(done => {

      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_recipe_orders (
        id,
        recipe_run_id,
        recipe_order_group_id,
        investment_id,
        instrument_id,
        instrument,
        side,
        target_exchange_id,
        exchange,
        price,
        quantity,
        spend_amount,
        sum_of_exchange_trading_fee,
        status,
        created_timestamp,
        completed_timestamp
      ) AS
      ( 
        SELECT 
          o.id,
          og.recipe_run_id,
          o.recipe_order_group_id,
          inv.id as investment_id,
          o.instrument_id,
          ins.symbol AS instrument,
          CONCAT('orders.side.',o.side),
          o.target_exchange_id,
          ex.name AS exchange,
          o.price,
          (
            CASE WHEN imd.ask_price=0 OR imd.ask_price IS NULL
              THEN eo.filled_quantity
              ELSE ((o.spend_amount - eo.sold_amount) / imd.ask_price) + eo.filled_quantity
            END
          ) as quantity,
          o.spend_amount,
          COALESCE(eo.sum_of_exchange_trading_fee, 0) as sum_of_exchange_trading_fee,
          CONCAT('orders.status.',o.status),
          og.created_timestamp,
          eo.completed_timestamp
        FROM public.recipe_order_group AS og
        JOIN public.recipe_order as o ON o.recipe_order_group_id = og.id
        LEFT JOIN public.recipe_run as rr ON og.recipe_run_id = rr.id
        LEFT JOIN public.investment_run AS inv ON rr.investment_run_id = inv.id
        LEFT JOIN public.instrument AS ins ON o.instrument_id = ins.id
        LEFT JOIN public.exchange AS ex ON o.target_exchange_id = ex.id 
        LEFT JOIN LATERAL (
          SELECT ask_price
          FROM instrument_market_data
          WHERE instrument_id=o.instrument_id
            AND exchange_id=o.target_exchange_id
          ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
          LIMIT 1
        ) as imd ON TRUE
        LEFT JOIN (
          SELECT 
            ro.id,
            COALESCE(SUM(eo.spend_amount), 0) as sold_amount,
            COALESCE(SUM(eo.fee),0) sum_of_exchange_trading_fee,
            ( CASE WHEN ro.status=${RECIPE_ORDER_STATUSES.Completed}
              THEN MAX(eo.completed_timestamp)
              ELSE NULL
            END ) as completed_timestamp,
            COALESCE(SUM(eo.total_quantity), 0) as filled_quantity
          FROM public.recipe_order ro
          LEFT JOIN public.execution_order eo ON eo.recipe_order_id=ro.id
          GROUP BY ro.id
        ) AS eo ON eo.id = o.id
      )
      `);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_orders').then(() => {
      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_recipe_orders (
        id,
        recipe_run_id,
        recipe_order_group_id,
        investment_id,
        instrument_id,
        instrument,
        side,
        target_exchange_id,
        exchange,
        price,
        quantity,
        sum_of_exchange_trading_fee,
        status,
        created_timestamp,
        completed_timestamp
      ) AS
      ( 
        SELECT 
          o.id,
          og.recipe_run_id,
          o.recipe_order_group_id,
          inv.id as investment_id,
          o.instrument_id,
          ins.symbol AS instrument,
          CONCAT('orders.side.',o.side),
          o.target_exchange_id,
          ex.name AS exchange,
          o.price,
          o.quantity,
          COALESCE(eo.sum_of_exchange_trading_fee, 0) as sum_of_exchange_trading_fee,
          CONCAT('orders.status.',o.status),
          og.created_timestamp,
          eo.completed_timestamp
        FROM public.recipe_order_group AS og
        JOIN public.recipe_order as o ON o.recipe_order_group_id = og.id
        LEFT JOIN public.recipe_run as rr ON og.recipe_run_id = rr.id
        LEFT JOIN public.investment_run AS inv ON rr.investment_run_id = inv.id
        LEFT JOIN public.instrument AS ins ON o.instrument_id = ins.id
        LEFT JOIN public.exchange AS ex ON o.target_exchange_id = ex.id 
        LEFT JOIN (
          SELECT 
          ro.id,
          SUM(eo.price) sum_of_exchange_trading_fee,
          ( CASE WHEN ro.status=${RECIPE_ORDER_STATUSES.Completed}
            THEN MAX(eo.completed_timestamp)
            ELSE NULL
          END ) as completed_timestamp
          FROM public.recipe_order ro
          LEFT JOIN public.execution_order eo ON eo.recipe_order_id=ro.id
          GROUP BY ro.id
        ) AS eo ON eo.id = o.id
      )
      `);
    });
  }
};