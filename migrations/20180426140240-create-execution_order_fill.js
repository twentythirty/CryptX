'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('execution_order_fill', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      execution_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "execution_order",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      filled_quantity: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      fill_timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('execution_order_fill');
  }
};