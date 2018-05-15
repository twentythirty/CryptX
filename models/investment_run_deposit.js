"use strict";

module.exports = (sequelize, DataTypes) => {
  var InvestmentRunDeposit = sequelize.define(
    "InvestmentRunDeposit",
    {
      amount: DataTypes.DECIMAL,
    },
    modelProps("investment_run_deposit", "Funds deposited for investing during single investment run")
  );

  InvestmentRunDeposit.associate = function(models) {
    InvestmentRunDeposit.belongsTo(models.Instrument);
    InvestmentRunDeposit.belongsTo(models.InvestmentRun);
  };

  return InvestmentRunDeposit;
};
