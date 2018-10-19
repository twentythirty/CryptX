'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('exchange_credential', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      exchange_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'exchange',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
        allowNull: false
      },
      api_user_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      api_password: {
        type: Sequelize.BLOB,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('exchange_credential');
  }
};
