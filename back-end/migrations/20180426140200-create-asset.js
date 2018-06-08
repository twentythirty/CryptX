'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('asset', {
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
      is_deposit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }).then(() => {

      return queryInterface.addIndex(
        'asset', {
          fields: ['symbol'],
          name: 'asset_symbols_idx',
          unique: false
        }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('asset');
  }
};