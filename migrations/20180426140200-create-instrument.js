'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('instrument', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      symbol: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
      },
      long_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_base: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      is_blacklisted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      tick_size: {
        type: Sequelize.DECIMAL
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('instrument');
  }
};