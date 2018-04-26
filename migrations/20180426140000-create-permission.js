'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('permission', {
      id: {
        type: Sequelize.ENUM,
        primaryKey: true,
        values: Object.keys(all_permissions)
      },
      name: {
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('permission');
  }
};