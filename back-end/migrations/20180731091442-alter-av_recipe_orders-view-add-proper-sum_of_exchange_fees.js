'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
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
        ( SELECT 
            o.id,
            og.recipe_run_id,
            o.recipe_order_group_id,
            inv.id as investment_id,
            o.instrument_id,
            ins.symbol AS instrument,
            o.side,
            o.target_exchange_id,
            ex.name AS exchnage,
            o.price,
            o.quantity,
            (SELECT SUM(fee) FROM public.execution_order AS execution_orders_fees) AS sum_of_exchange_trading_fee,
            o.status,
            og.created_timestamp,
            (CASE WHEN o.status=${RECIPE_ORDER_STATUSES.Completed} THEN (
                SELECT completed_timestamp FROM public.execution_order AS eo WHERE o.id = eo.recipe_order_id ORDER BY completed_timestamp DESC LIMIT 1
            ) ELSE NULL END) AS completed_timestamp
        FROM public.recipe_order_group AS og
        LEFT JOIN public.recipe_order as o ON o.recipe_order_group_id = og.id
        LEFT JOIN public.recipe_run as rr ON og.recipe_run_id = rr.id
        LEFT JOIN public.investment_run AS inv ON rr.investment_run_id = inv.id
        LEFT JOIN public.instrument AS ins ON o.instrument_id = ins.id
        LEFT JOIN public.exchange AS ex ON o.target_exchange_id = ex.id )
      `);
  },

  down: (queryInterface, Sequelize) => {
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
        ( SELECT 
            o.id,
            og.recipe_run_id,
            o.recipe_order_group_id,
            inv.id as investment_id,
            o.instrument_id,
            ins.symbol AS instrument,
            o.side,
            o.target_exchange_id,
            ex.name AS exchnage,
            o.price,
            o.quantity,
            (SELECT SUM(price) FROM public.execution_order AS fake_sum_fee) AS sum_of_exchange_trading_fee,
            o.status,
            og.created_timestamp,
            (CASE WHEN o.status=${RECIPE_ORDER_STATUSES.Completed} THEN (
                SELECT completed_timestamp FROM public.execution_order AS eo WHERE o.id = eo.recipe_order_id ORDER BY completed_timestamp DESC LIMIT 1
            ) ELSE NULL END) AS completed_timestamp
        FROM public.recipe_order_group AS og
        LEFT JOIN public.recipe_order as o ON o.recipe_order_group_id = og.id
        LEFT JOIN public.recipe_run as rr ON og.recipe_run_id = rr.id
        LEFT JOIN public.investment_run AS inv ON rr.investment_run_id = inv.id
        LEFT JOIN public.instrument AS ins ON o.instrument_id = ins.id
        LEFT JOIN public.exchange AS ex ON o.target_exchange_id = ex.id )
      `);
  }
};
