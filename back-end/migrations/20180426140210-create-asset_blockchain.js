'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('asset_blockchain', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      asset_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "asset",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      coinmarketcap_identifier: {
        allowNull: false,
        unique: false,
        type: Sequelize.STRING
      }
    }).then(() => {

      return queryInterface.addIndex(
        'asset_blockchain', {
          fields: ['coinmarketcap_identifier'],
          name: 'coinmarketcap_id_idx',
          unique: false
        }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('asset_blockchain');
  }
};