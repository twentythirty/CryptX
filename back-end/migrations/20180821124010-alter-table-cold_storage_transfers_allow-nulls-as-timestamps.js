'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE cold_storage_transfer ALTER COLUMN placed_timestamp DROP NOT NULL').then(() => {
      return queryInterface.sequelize.query('ALTER TABLE cold_storage_transfer ALTER COLUMN completed_timestamp DROP NOT NULL');
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE cold_storage_transfer ALTER COLUMN placed_timestamp SET NOT NULL').then(() => {
      return queryInterface.sequelize.query('ALTER TABLE cold_storage_transfer ALTER COLUMN completed_timestamp SET NOT NULL');
    });;
  }
};
