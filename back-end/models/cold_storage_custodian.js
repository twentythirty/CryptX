"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageCustodian = sequelize.define(
    "ColdStorageCustodian",
    {
      name: DataTypes.STRING
    },
    modelProps(
      "cold_storage_custodian",
      "This table defines available custodians"
    )
  );

  return ColdStorageCustodian;
};