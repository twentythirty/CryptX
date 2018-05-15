'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('instrument_blockchain', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      instrument_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "instrument",
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
        'instrument_blockchain', {
          fields: ['coinmarketcap_identifier'],
          name: 'coinmarketcap_id_idx',
          unique: false
        }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('instrument_blockchain');
  }
};