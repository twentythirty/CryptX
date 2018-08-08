'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE recipe_run_deposit ALTER COLUMN amount DROP NOT NULL');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE recipe_run_deposit ALTER COLUMN amount SET NOT NULL');
  }
};
