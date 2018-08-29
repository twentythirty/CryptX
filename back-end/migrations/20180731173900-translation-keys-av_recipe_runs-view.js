'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_runs').then(() => {
      return queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW av_recipe_runs (
          id,
          investment_run_id,
          created_timestamp,
          approval_status,
          approval_comment,
          approval_timestamp,
          user_created_id,
          user_created,
          approval_user_id,
          approval_user
        ) AS
        ( SELECT
          recipe.id,
          recipe.investment_run_id,
          recipe.created_timestamp,
          CONCAT('recipes.status.',recipe.approval_status),
          recipe.approval_comment,
          recipe.approval_timestamp,
          recipe.user_created_id,
          concat(cu.first_name, ' ', cu.last_name) AS user_created,
          recipe.approval_user_id,
          (CASE WHEN recipe.approval_user_id IS NULL THEN NULL ELSE concat(au.first_name, ' ', au.last_name) END) AS approval_user
        FROM public.recipe_run AS recipe
        JOIN public.user AS cu ON recipe.user_created_id = cu.id
        LEFT OUTER JOIN public.user AS au ON recipe.approval_user_id = au.id )
      `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW av_recipe_runs').then(() => {
      return queryInterface.sequelize.queryInterface(`
        CREATE OR REPLACE VIEW av_recipe_runs (
          id,
          investment_run_id,
          created_timestamp,
          approval_status,
          approval_comment,
          approval_timestamp,
          user_created_id,
          user_created,
          approval_user_id,
          approval_user
        ) AS
        ( SELECT
          recipe.id,
          recipe.investment_run_id,
          recipe.created_timestamp,
          recipe.approval_status,
          recipe.approval_comment,
          recipe.approval_timestamp,
          recipe.user_created_id,
          concat(cu.first_name, ' ', cu.last_name) AS user_created,
          recipe.approval_user_id,
          (CASE WHEN recipe.approval_user_id IS NULL THEN NULL ELSE concat(au.first_name, ' ', au.last_name) END) AS approval_user
        FROM public.recipe_run AS recipe
        JOIN public.user AS cu ON recipe.user_created_id = cu.id
        LEFT OUTER JOIN public.user AS au ON recipe.approval_user_id = au.id )
      `)
    });
  }
};
