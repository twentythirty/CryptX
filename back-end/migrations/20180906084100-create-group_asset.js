'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('group_asset', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      investment_run_asset_group_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "investment_run_asset_group",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
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
      status: {
        type: Sequelize.SMALLINT
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('group_asset');
  }
};