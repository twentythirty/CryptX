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
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.keys(STRATEGY_TYPES)
      },
      is_simulated: DataTypes.BOOLEAN,
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: INVESTMENT_RUN_STATUSES
      }
    },
    modelProps("investment_run", "Investment workflow run")
  );

  InvestmentRun.associate = function(models) {
    InvestmentRun.belongsTo(models.Instrument);
    InvestmentRun.belongsTo(models.User, {
      foreignKey: "user_created_id",
      as: "user_created"
    });
  };

  return InvestmentRun;
};
