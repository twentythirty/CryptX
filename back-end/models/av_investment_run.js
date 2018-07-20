"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVInvestmentRun = sequelize.define(
    "AVInvestmentRun",
    {
      started_timestamp: DataTypes.DATE,
      updated_timestamp: DataTypes.DATE,
      completed_timestamp: DataTypes.DATE,
      strategy_type: DataTypes.SMALLINT,
      is_simulated: DataTypes.BOOLEAN,
      user_created: DataTypes.STRING
    },
    //common global model props
    modelProps('av_investment_runs', 'Investment runs of the CryptX system')
  );

  return AVInvestmentRun;
};
