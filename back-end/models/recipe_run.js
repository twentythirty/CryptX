"use strict";

module.exports = (sequelize, DataTypes) => {
  var RecipeRun = sequelize.define(
    "RecipeRun", {
      created_timestamp: DataTypes.DATE,
      approval_status: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      approval_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      approval_comment: {
        type: DataTypes.TEXT("medium"),
        allowNull: true
      }
    },
    modelProps(
      "recipe_run",
      "This table describes meta information of a recipe running for investment"
    )
  );

  RecipeRun.associate = function (models) {
    RecipeRun.belongsTo(models.InvestmentRun);
    RecipeRun.belongsTo(models.User, {
      as: "user_created",
      foreignKey: "user_created_id"
    });
    RecipeRun.belongsTo(models.User, {
      as: 'approval_user',
      foreignKey: 'approval_user_id'
    });
  };

  RecipeRun.prototype.toWeb = function() {
    let json = this.toJSON();
    
    json.created_timestamp = json.created_timestamp.getTime();
    json.approval_timestamp = ( json.approval_timestamp ? json.approval_timestamp.getTime() : json.approval_timestamp );

    return json;
  };

  return RecipeRun;
};