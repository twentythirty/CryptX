'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('execution_order_fill', 'price', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0.0
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('execution_order_fill', 'price');
  }
};
