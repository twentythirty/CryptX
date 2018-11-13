'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE cold_storage_transfer ALTER COLUMN fee DROP NOT NULL');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE cold_storage_transfer ALTER COLUMN fee SET NOT NULL');
  }
};
