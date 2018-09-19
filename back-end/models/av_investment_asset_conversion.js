"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVInvestmentAssetConversion = sequelize.define(
    "AVInvestmentAssetConversion",
    {
      id: { 
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      recipe_run_id: DataTypes.INTEGER,
      investment_currency: DataTypes.STRING,
      investment_amount: DataTypes.DECIMAL,
      target_currency: DataTypes.STRING,
      converted_amount: DataTypes.DECIMAL,
      status: DataTypes.STRING
    },
    //common global model props
    modelProps('av_investment_asset_conversions', 'Asset conversion from one asset to another')
  );

  return AVInvestmentAssetConversion;
};
