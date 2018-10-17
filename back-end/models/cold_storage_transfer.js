"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageTransfer = sequelize.define(
    "ColdStorageTransfer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      status: {
          type: DataTypes.SMALLINT,
          allowNull: false
      },
      placed_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completed_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      fee: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0.0
      },
      external_identifier: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    modelProps(
      "cold_storage_transfer",
      "This table connects cold storage accounts with recipe orders that deposit into them"
    )
  );

  ColdStorageTransfer.associate = function (models) {

    ColdStorageTransfer.belongsTo(models.RecipeOrder, {
      foreignKey: 'recipe_run_order_id'
    });
    ColdStorageTransfer.belongsTo(models.Asset);
    ColdStorageTransfer.belongsTo(models.ColdStorageAccount)
    ColdStorageTransfer.belongsTo(models.RecipeRun, {
      foreignKey: 'recipe_run_id'
    });
  };

  return ColdStorageTransfer;
};
