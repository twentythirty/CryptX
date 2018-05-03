"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageRecipeOrder = sequelize.define(
    "ColdStorageRecipeOrder",
    {
      //by default join tables remove primary keys
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      status: {
          type: DataTypes.ENUM,
          allowNull: false,
          values: Object.keys(COLD_STORAGE_TRANSFER_STATUSES)
      },
      placed_timestamp: DataTypes.DATE,
      completed_timestamp: DataTypes.DATE
    },
    modelProps(
      "cold_storage_recipe_order",
      "This table connects cold storage accounts with recipe orders that deposit into them"
    )
  );

  return ColdStorageRecipeOrder;
};
