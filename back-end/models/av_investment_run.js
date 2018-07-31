"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVInvestmentRun = sequelize.define(
    "AVInvestmentRun",
    {
      started_timestamp: DataTypes.DATE,
      updated_timestamp: DataTypes.DATE,
      completed_timestamp: DataTypes.DATE,
      strategy_type: DataTypes.STRING,
      is_simulated: DataTypes.STRING,
      user_created: DataTypes.STRING,
      user_created_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      deposit_usd: DataTypes.DECIMAL
    },
    //common global model props
    modelProps('av_investment_runs', 'Investment runs of the CryptX system')
  );

  AVInvestmentRun.prototype.toWeb = function() {
    let json = this.toJSON();
    
    json.started_timestamp = json.started_timestamp.getTime();
    json.updated_timestamp = json.updated_timestamp.getTime();
    json.completed_timestamp = (json.completed_timestamp != null ? json.completed_timestamp.getTime() : json.completed_timestamp);

    return json;
  };

  return AVInvestmentRun;
};
