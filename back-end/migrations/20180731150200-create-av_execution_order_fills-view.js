'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_execution_order_fills (id, fill_time, fill_price, quantity) AS
    SELECT fill.id AS id,
           fill.timestamp AS fill_time,
           eo.price * (fill.quantity / eo.total_quantity) AS fill_price,
           fill.quantity AS quantity
    FROM execution_order_fill AS fill
    JOIN execution_order eo ON eo.id = fill.execution_order_id
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_execution_order_fills');
  }
};