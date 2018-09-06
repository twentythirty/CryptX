"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVInvestmentRun = sequelize.define(
    "AVInvestmentRun",
    {
      id: { 
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      investment_run_id: DataTypes.INTEGER,
      currency_name: DataTypes.STRING,
      currency_symbol: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      value_usd: DataTypes.DECIMAL
    },
    //common global model props
    modelProps('av_investment_amount', 'Different currency deposit amounts that fund investment run')
  );

  return AVInvestmentRun;
};
