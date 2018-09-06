'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cold_storage_account_storage_fee',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        creation_timestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        amount: {
          type: Sequelize.DECIMAL,
          allowNull: false
        },
        cold_storage_account_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'cold_storage_account',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }
      }

    ).then(() => {
      return queryInterface.addIndex('cold_storage_account_storage_fee', {
        fields: [{ attribute: 'creation_timestamp', order: 'DESC'}]
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cold_storage_account_storage_fee');
  }
};
