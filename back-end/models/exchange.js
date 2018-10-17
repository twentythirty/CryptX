"use strict";

module.exports = (sequelize, DataTypes) => {
  var Exchange = sequelize.define(
    "Exchange",
    {
      name: DataTypes.STRING,
      api_id: DataTypes.STRING,
      is_mappable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
    },
    modelProps(
      "exchange",
      "This table contains exchanges will be used for investing"
    )
  );

  Exchange.associate = function(models) {
    Exchange.belongsToMany(models.Instrument, {
      through: models.InstrumentExchangeMapping
    });
  };

  Exchange.prototype.toWeb = function(send_roles = true) {
    let json = this.toJSON();
    delete json.api_id;
    
    return json;
  };

  return Exchange;
};
