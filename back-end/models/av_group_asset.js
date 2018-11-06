"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVGroupAsset = sequelize.define(
    "AVGroupAsset",
    {
      symbol: DataTypes.STRING,
      long_name: DataTypes.STRING,
      capitalization: DataTypes.DECIMAL,
      nvt_ratio: DataTypes.DECIMAL,
      market_share: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      comment: DataTypes.STRING
    },
    //common global model props
    modelProps('av_group_assets', 'Assets belonging to Asset Mixes')
  );

  return AVGroupAsset;
};
