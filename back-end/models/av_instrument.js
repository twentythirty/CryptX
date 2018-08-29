"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVInstrument = sequelize.define(
    "AVInstrument",
    {
      symbol: DataTypes.STRING,
      exchanges_connected: DataTypes.INTEGER,
      exchanges_failed: DataTypes.INTEGER
    },
    //common global model props
    modelProps('av_instruments', 'Instruments of the CryptX system')
  );

  return AVInstrument;
};
