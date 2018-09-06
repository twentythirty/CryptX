"use strict";

module.exports = (sequelize, DataTypes) => {
  var InvestmentRun = sequelize.define(
    "InvestmentRun",
    {
      started_timestamp: DataTypes.DATE,
      updated_timestamp: DataTypes.DATE,
      completed_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      strategy_type: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      is_simulated: DataTypes.BOOLEAN,
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: INVESTMENT_RUN_STATUSES.Initiated
      },
      deposit_usd: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
    },
    modelProps("investment_run", "Investment workflow run")
  );

  InvestmentRun.associate = function(models) {
    InvestmentRun.hasMany(models.RecipeRun);
    InvestmentRun.belongsTo(models.User, {
      foreignKey: "user_created_id",
      as: "user_created"
    });
    InvestmentRun.belongsTo(models.InvestmentRunAssetGroup);
    InvestmentRun.hasMany(models.InvestmentAmount);
  };

  InvestmentRun.prototype.toWeb = function() {
    let json = this.toJSON();
    
    json.started_timestamp = json.started_timestamp.getTime();
    json.updated_timestamp = json.updated_timestamp.getTime();
    json.completed_timestamp = (json.completed_timestamp != null ? json.completed_timestamp.getTime() : json.completed_timestamp);

    return json;
  };


  return InvestmentRun;
};
