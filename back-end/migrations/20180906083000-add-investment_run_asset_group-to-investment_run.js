'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('investment_run', 'investment_run_asset_group', {
      type: Sequelize.INTEGER,
      references: {
        model: "user",
        key: "id"
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('investment_run', 'investment_run_asset_group');
  }
};