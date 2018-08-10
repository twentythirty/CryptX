'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE execution_order ALTER COLUMN price DROP NOT NULL')
    .then(() => {
      return queryInterface.sequelize.query('ALTER TABLE execution_order ALTER COLUMN fee DROP NOT NULL');
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE execution_order ALTER COLUMN price SET NOT NULL')
    .then(() => {
      return queryInterface.sequelize.query('ALTER TABLE execution_order ALTER COLUMN fee SET NOT NULL');
    });
  }
};
