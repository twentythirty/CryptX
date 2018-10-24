'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exchange_credential');

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
      api_key: {
        type: Sequelize.BLOB,
        allowNull: false
      },
      api_secret: {
        type: Sequelize.BLOB,
        allowNull: false
      },
      admin_password: {
        type: Sequelize.BLOB,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exchange_credential');

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

  }
};