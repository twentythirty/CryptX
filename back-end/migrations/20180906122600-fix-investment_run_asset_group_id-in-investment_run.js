'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('investment_run', 'investment_run_asset_group').then(() => {
      return queryInterface.addColumn('investment_run', 'investment_run_asset_group_id', {
        type: Sequelize.INTEGER,
        references: {
          model: "investment_run_asset_group",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('investment_run', 'investment_run_asset_group_id').then(() => {
      queryInterface.addColumn('investment_run', 'investment_run_asset_group', {
        type: Sequelize.INTEGER,
        references: {
          model: "investment_run_asset_group",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      });
    });
  }
};