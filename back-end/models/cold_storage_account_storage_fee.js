"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageAccountStorageFee = sequelize.define(
    "ColdStorageAccountStorageFee",
    {
        creation_timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
        }
    },
    modelProps(
      "cold_storage_account_storage_fee",
      "This table defines codl storage accounts storage fee amounts by the custodians"
    )
  );

  ColdStorageAccountStorageFee.associate = function(models) {
    ColdStorageAccountStorageFee.belongsTo(models.ColdStorageAccount);
  };

  ColdStorageAccountStorageFee.prototype.toWeb = function() {

    let json = this.toJSON();

    json.creation_timestamp = json.creation_timestamp ? json.creation_timestamp.getTime() : json.creation_timestamp;

    return json;
    
  };

  return ColdStorageAccountStorageFee;
};
