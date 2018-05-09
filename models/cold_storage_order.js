"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageOrder = sequelize.define(
    "ColdStorageOrder",
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
      "cold_storage_order",
      "This table connects cold storage accounts with recipe orders that deposit into them"
    )
  );

  return ColdStorageOrder;
};
