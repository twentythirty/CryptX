"use strict";

module.exports = (sequelize, DataTypes) => {
  var InvestmentRunAssetGroup = sequelize.define(
    "InvestmentRunAssetGroup",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      created_timestamp: {
        type: DataTypes.DECIMAL,
        allowNull: false
      }
    },
    modelProps(
      "investment_run_asset_group",
      "Asset of a group"
    )
  );

  InvestmentRunAssetGroup.associate = function(models) {
    InvestmentRunAssetGroup.belongsTo(models.User);
    InvestmentRunAssetGroup.hasMany(models.GroupAsset);
  };

  return InvestmentRunAssetGroup;
};
