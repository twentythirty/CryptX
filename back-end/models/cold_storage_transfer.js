"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageTransfer = sequelize.define(
    "ColdStorageTransfer",
    {
      //by default join tables remove primary keys
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      status: {
          type: DataTypes.SMALLINT,
          allowNull: false
      },
      placed_timestamp: DataTypes.DATE,
      completed_timestamp: DataTypes.DATE
    },
    modelProps(
      "cold_storage_transfer",
      "This table connects cold storage accounts with recipe orders that deposit into them"
    )
  );

  return ColdStorageTransfer;
};
