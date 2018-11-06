'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE exchange_credential ALTER COLUMN api_key DROP NOT NULL');
    await queryInterface.sequelize.query('ALTER TABLE exchange_credential ALTER COLUMN api_secret DROP NOT NULL');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE exchange_credential ALTER COLUMN api_key SET NOT NULL');
    await queryInterface.sequelize.query('ALTER TABLE exchange_credential ALTER COLUMN api_secret SET NOT NULL');
  }
};
