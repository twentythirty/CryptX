"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageAccount = sequelize.define(
    "ColdStorageAccount",
    {
      strategy_type: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      address: DataTypes.TEXT("medium")
    },
    modelProps(
      "cold_storage_account",
      "This table defines accounts available for cold storage of cryptocurrencies"
    )
  );

  ColdStorageAccount.associate = function(models) {
    ColdStorageAccount.belongsTo(models.Instrument);
    ColdStorageAccount.belongsToMany(models.ExecutionOrder, {
      through: models.ColdStorageOrder
    })
  };

  return ColdStorageAccount;
};
