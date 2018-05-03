"use strict";

module.exports = (sequelize, DataTypes) => {
  var RecipeRun = sequelize.define(
    "RecipeRun",
    {
      created_timestamp: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: RECIPE_RUN_STATUSES
      },
      comment: {
        type: DataTypes.TEXT("medium"),
        allowNull: false
      }
    },
    modelProps(
      "recipe_run",
      "This table describes meta information of a recipe running for investment"
    )
  );

  RecipeRun.associate = function(models) {
    RecipeRun.belongsTo(models.InvestmentRun);
    RecipeRun.belongsTo(models.User, {
      foreignKey: "user_created_id",
      as: "user_created"
    });
  };

  return RecipeRun;
};
