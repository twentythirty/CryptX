"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVAsset = sequelize.define(
    "AVAsset",
    {
      symbol: DataTypes.STRING,
      is_cryptocurrency: DataTypes.STRING,
      long_name: DataTypes.STRING,
      is_base: DataTypes.STRING,
      is_deposit: DataTypes.STRING,
      capitalization: DataTypes.DECIMAL,
      nvt_ratio: DataTypes.DECIMAL,
      market_share: DataTypes.DECIMAL,
      capitalization_updated: DataTypes.DATE,
      status: DataTypes.STRING
    },
    //common global model props
    modelProps('av_assets', 'Assets as seen by an Admin user')
  );

  return AVAsset;
};
