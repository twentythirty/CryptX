"use strict";

module.exports = (sequelize, DataTypes) => {
  var InvestmentAmount = sequelize.define(
    "InvestmentAmount",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      }
    },
    modelProps(
      "investment_amount",
      "This table describes what assets have been invested into investment run"
    )
  );

  InvestmentAmount.associate = function(models) {
    InvestmentAmount.belongsTo(models.InvestmentRun);
    InvestmentAmount.belongsTo(models.Asset);
  };

  return InvestmentAmount;
};
