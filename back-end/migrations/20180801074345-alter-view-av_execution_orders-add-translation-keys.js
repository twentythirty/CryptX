'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_execution_orders').then(done => {

      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_execution_orders (
          id,
          recipe_order_id,
          instrument_id,
          instrument,
          side,
          exchange_id,
          exchange,
          type,
          price,
          total_quantity,
          exchange_trading_fee,
          status,
          submission_time,
          completion_time
        ) AS
        ( SELECT
            eo.id,
            eo.recipe_order_id,
            eo.instrument_id,
            i.symbol AS instrument,
            (CASE WHEN eo.side = 1 THEN 'execution_orders.side.sell' ELSE 'execution_orders.side.buy' END) as side,
            eo.exchange_id,
            ex.name AS exhange,
            CONCAT('execution_orders.type.', eo.type) AS "type",
            eo.price,
            eo.total_quantity,
            eo.fee AS exchange_trading_fee,
            CONCAT('execution_orders.status.', eo.status) AS status,
            eo.placed_timestamp AS submission_time,
            eo.completed_timestamp AS completion_time
          FROM public.execution_order AS eo
          JOIN public.instrument AS i ON eo.instrument_id = i.id
          JOIN public.exchange AS ex ON eo.exchange_id = ex.id )
      `);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_execution_orders').then(() => {
      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_execution_orders (
          id,
          recipe_order_id,
          instrument_id,
          instrument,
          side,
          exchange_id,
          exchange,
          type,
          price,
          total_quantity,
          exchange_trading_fee,
          status,
          submission_time,
          completion_time
        ) AS
        ( SELECT
            eo.id,
            eo.recipe_order_id,
            eo.instrument_id,
            i.symbol AS instrument,
            eo.side,
            eo.exchange_id,
            ex.name AS exhange,
            eo.type,
            eo.price,
            eo.total_quantity,
            eo.fee AS exchange_trading_fee,
            eo.status,
            eo.placed_timestamp AS submission_time,
            eo.completed_timestamp AS completion_time
        FROM public.execution_order AS eo
        JOIN public.instrument AS i ON eo.instrument_id = i.id
        JOIN public.exchange AS ex ON eo.exchange_id = ex.id )
      `);
    });
  }
};