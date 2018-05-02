"use strict";

module.exports = (sequelize, DataTypes) => {
  var Exchange = sequelize.define(
    "Exchange",
    {
      name: DataTypes.STRING
    },
    modelProps(
      "exchange",
      "This table contains exchanges will be used for investing"
    )
  );

  Exchange.associate = function(models) {
    Exchange.belongsToMany(models.Instrument, {
      through: models.SymbolExchangeMapping
    });
  };

  return Exchange;
};
