"use strict";

module.exports = (sequelize, DataTypes) => {
  var RecipeRunDetailInvestment = sequelize.define(
    "RecipeRunDetailInvestment",
    {
      amount: DataTypes.DECIMAL
    },
    modelProps(
      "recipe_run_detail_investment",
      "This table contains recipe detail investment amounts"
    )
  );

  RecipeRunDetailInvestment.associate = function(models) {
    RecipeRunDetailInvestment.belongsTo(models.RecipeRunDetail);
    RecipeRunDetailInvestment.belongsTo(models.Asset);
  };

  return RecipeRunDetailInvestment;
};
