'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('action_log', 'level', {
      type: Sequelize.SMALLINT,
      defaultValue: LOG_LEVELS.Info
    }).then(() => {
      return queryInterface.addIndex('action_log', {
        fields: ['level']
      })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('action_log', 'level');
  }
};
