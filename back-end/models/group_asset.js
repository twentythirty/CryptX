"use strict";

module.exports = (sequelize, DataTypes) => {
  var GroupAsset = sequelize.define(
    "GroupAsset",
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
      },
      status: {
        type: DataTypes.SMALLINT
      }
    },
    modelProps(
      "group_asset",
      "This table describes an asset in asset group"
    )
  );

  GroupAsset.associate = function(models) {
    GroupAsset.belongsTo(models.InvestmentRunAssetGroup);
    GroupAsset.belongsTo(models.Asset);
  };

  return GroupAsset;
};
