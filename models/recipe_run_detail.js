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
      foreignKey: "transaction_asset_id",
      as: "transaction_asset"
    });
    RecipeRunDetail.belongsTo(models.Asset, {
      foreignKey: "quote_asset_id",
      as: "quote_asset"
    });
    RecipeRunDetail.belongsTo(models.Exchange, {
      foreignKey: "target_exchange_id",
      as: "target_exchange"
    });
  };

  return RecipeRunDetail;
};
