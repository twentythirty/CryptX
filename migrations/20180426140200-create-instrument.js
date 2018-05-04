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
        unique: false
      },
      long_name: {
        type: Sequelize.TEXT('medium'),
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
    }).then(() => {

      return queryInterface.addIndex(
        'instrument', {
          fields: ['symbol'],
          name: 'instrument_symbols_idx',
          unique: false
        }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('instrument');
  }
};