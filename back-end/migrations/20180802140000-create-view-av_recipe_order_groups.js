'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW av_recipe_order_groups (
      id, 
      created_timestamp,
      status,
      approval_user,
      approval_comment
    ) AS (
    SELECT
      og.id as id,
      og.created_timestamp as created_timestamp,
      concat('orders_group.status.', og.approval_status) as status,
      (CASE
         WHEN og.approval_user_id IS NULL THEN NULL
        ELSE concat(u.first_name, ' ', u.last_name) 
      END) AS approval_user,
      og.approval_comment as approval_comment
    FROM 
      recipe_order_group AS og
      LEFT JOIN public.user AS u ON og.approval_user_id = u.id
    )
    `)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_order_groups');
  }
};