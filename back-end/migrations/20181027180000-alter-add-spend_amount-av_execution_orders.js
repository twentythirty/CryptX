'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW av_execution_orders`).then(done => {
      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_execution_orders (
        id, 
        investment_run_id,
        recipe_order_id,
        instrument_id,
        instrument,
        side,
        exchange_id,
        exchange,
        type,
        price,
        total_quantity,
        filled_quantity,
        spend_amount,
        exchange_trading_fee,
        status,
        submission_time,
        completion_time
      )
      AS
      (  SELECT eo.id,
          rr.investment_run_id,
          eo.recipe_order_id,
          eo.instrument_id,
          i.symbol AS instrument,
          concat('execution_orders.side.', eo.side) AS side,
          eo.exchange_id,
          ex.name AS exchange,
          concat('execution_orders.type.', eo.type) AS type,
          eo.price,
          eo.total_quantity,
          COALESCE(filled_quantity.total_quantity, (0)::numeric) AS filled_quantity,
          eo.spend_amount,
          eo.fee AS exchange_trading_fee,
          concat('execution_orders.status.', eo.status) AS status,
          eo.placed_timestamp AS submission_time,
          eo.completed_timestamp AS completion_time
        FROM ((((((execution_order eo
          LEFT JOIN instrument i ON ((eo.instrument_id = i.id)))
          LEFT JOIN exchange ex ON ((eo.exchange_id = ex.id)))
          LEFT JOIN recipe_order ro ON ((ro.id = eo.recipe_order_id)))
          LEFT JOIN recipe_order_group rog ON ((rog.id = ro.recipe_order_group_id)))
          LEFT JOIN recipe_run rr ON ((rr.id = rog.recipe_run_id)))
          LEFT JOIN LATERAL ( SELECT sum(eof.quantity) AS total_quantity,
              eof.execution_order_id
            FROM execution_order_fill eof
            GROUP BY eof.execution_order_id
          ) filled_quantity ON ((filled_quantity.execution_order_id = eo.id)))
      )
        `)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW av_execution_orders`).then(done => {
      return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW av_execution_orders (
        id, 
        investment_run_id,
        recipe_order_id,
        instrument_id,
        instrument,
        side,
        exchange_id,
        exchange,
        type,
        price,
        total_quantity,
        filled_quantity,
        exchange_trading_fee,
        status,
        submission_time,
        completion_time
      )
      AS
      (  SELECT eo.id,
          rr.investment_run_id,
          eo.recipe_order_id,
          eo.instrument_id,
          i.symbol AS instrument,
          concat('execution_orders.side.', eo.side) AS side,
          eo.exchange_id,
          ex.name AS exchange,
          concat('execution_orders.type.', eo.type) AS type,
          eo.price,
          eo.total_quantity,
          COALESCE(filled_quantity.total_quantity, (0)::numeric) AS filled_quantity,
          eo.fee AS exchange_trading_fee,
          concat('execution_orders.status.', eo.status) AS status,
          eo.placed_timestamp AS submission_time,
          eo.completed_timestamp AS completion_time
        FROM ((((((execution_order eo
          LEFT JOIN instrument i ON ((eo.instrument_id = i.id)))
          LEFT JOIN exchange ex ON ((eo.exchange_id = ex.id)))
          LEFT JOIN recipe_order ro ON ((ro.id = eo.recipe_order_id)))
          LEFT JOIN recipe_order_group rog ON ((rog.id = ro.recipe_order_group_id)))
          LEFT JOIN recipe_run rr ON ((rr.id = rog.recipe_run_id)))
          LEFT JOIN LATERAL ( SELECT sum(eof.quantity) AS total_quantity,
                  eof.execution_order_id
                FROM execution_order_fill eof
                GROUP BY eof.execution_order_id) filled_quantity ON ((filled_quantity.execution_order_id = eo.id)))
        )
        `)
    });
  }
};