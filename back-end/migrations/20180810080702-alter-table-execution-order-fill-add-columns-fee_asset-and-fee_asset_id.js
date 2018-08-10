'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('execution_order_fill', 'fee_asset_symbol', {
      type: Sequelize.STRING,
      allowNull: true
    }).then(() => {
      return queryInterface.addColumn('execution_order_fill', 'fee_asset_id', {
        type: Sequelize.SMALLINT,
        allowNull: true
      }).then(() => {
        return queryInterface.addConstraint('execution_order_fill', ['fee_asset_id'], {
          type: 'foreign key',
          references: {
            table: 'asset',
            field: 'id'
          },
          onDelete: 'set null',
          onUpdate: 'cascade'
        });
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('execution_order_fill', 'fee_asset_symbol').then(() => {
      return queryInterface.removeColumn('execution_order_fill', 'fee_asset_id');
    });
  }
};
