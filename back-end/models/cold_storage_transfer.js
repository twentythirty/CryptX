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
      placed_timestamp: DataTypes.DATE,
      completed_timestamp: DataTypes.DATE,
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      fee: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0.0
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
  };

  return ColdStorageTransfer;
};
