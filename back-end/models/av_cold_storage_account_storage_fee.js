"use strict";

module.exports = (sequelize, DataTypes) => {
    const AVColdStorageAccountStorageFee = sequelize.define(
        "AVColdStorageAccountStorageFee",
        {
            creation_timestamp: DataTypes.DATE,
            amount: DataTypes.DECIMAL,
            asset: DataTypes.STRING,
            cold_storage_account_id: DataTypes.INTEGER,
            custodian: DataTypes.STRING,
            strategy_type: DataTypes.STRING
        },
        //common global model props
        modelProps('av_cold_storage_account_storage_fees', 'Cold storage account storage fees issued by the custodian')
    );

    AVColdStorageAccountStorageFee.prototype.toWeb = function () {

        let json = this.toJSON();

        json.creation_timestamp = json.creation_timestamp ? json.creation_timestamp.getTime() : json.creation_timestamp;

        return json;

    };

    return AVColdStorageAccountStorageFee;
};
