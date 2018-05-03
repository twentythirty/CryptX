"use strict";

module.exports = (sequelize, DataTypes) => {
  var RecipeRunDetail = sequelize.define(
    "RecipeRunDetail",
    {
      base_instrument_amount: DataTypes.DECIMAL,
      target_instrument_amount: DataTypes.DECIMAL,
      target_instrument_price: DataTypes.DECIMAL
    },
    modelProps(
      "recipe_run_detail",
      "This table contains detailed information on the running recipe"
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
