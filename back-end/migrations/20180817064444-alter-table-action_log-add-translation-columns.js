'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('action_log', 'translation_key', {
      type: Sequelize.STRING,
      allowNull: true
    }).then(() => {
      return queryInterface.addColumn('action_log', 'translation_args', {
        type: Sequelize.STRING,
        allowNull: true
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('action_log', 'translation_key').then(() => {
      return queryInterface.removeColumn('action_log', 'translation_args');
    });
  }
};
