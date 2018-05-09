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
    RecipeRunDetail.belongsTo(models.Instrument, {
      foreignKey: "base_instrument_id",
      as: "base_instrument"
    });
    RecipeRunDetail.belongsTo(models.Instrument, {
      foreignKey: "target_instrument_id",
      as: "target_instrumen"
    });
    RecipeRunDetail.belongsTo(models.Exchange, {
      foreignKey: "target_exchange_id",
      as: "target_exchange"
    });
  };

  return RecipeRunDetail;
};
