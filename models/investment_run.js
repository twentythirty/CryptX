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
      amount: DataTypes.DECIMAL,
      strategy_type: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      is_simulated: DataTypes.BOOLEAN,
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false
      }
    },
    modelProps("investment_run", "Investment workflow run")
  );

  InvestmentRun.associate = function(models) {
    InvestmentRun.belongsTo(models.User, {
      foreignKey: "user_created_id",
      as: "user_created"
    });
  };

  return InvestmentRun;
};
