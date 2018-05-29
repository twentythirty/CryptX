"use strict";

module.exports = (sequelize, DataTypes) => {
  var RecipeRunDetail = sequelize.define(
    "RecipeRunDetail",
    {
      investment_percentage: DataTypes.DECIMAL
    },
    modelProps(
      "recipe_run_detail",
      "This table contains investment percentage information on the running recipe"
    )
  );

  RecipeRunDetail.associate = function(models) {
    RecipeRunDetail.belongsTo(models.RecipeRun);
    RecipeRunDetail.belongsTo(models.Asset, {
      foreignKey: "base_asset_id",
      as: "base_asset"
    });
    RecipeRunDetail.belongsTo(models.Asset, {
      foreignKey: "target_asset_id",
      as: "target_asset"
    });
    RecipeRunDetail.belongsTo(models.Exchange, {
      foreignKey: "target_exchange_id",
      as: "target_exchange"
    });
  };

  return RecipeRunDetail;
};
