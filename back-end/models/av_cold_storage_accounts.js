"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVColdStorageAccount = sequelize.define(
        "AVColdStorageAccount",
        {   
            asset: DataTypes.STRING,
            strategy_type: DataTypes.STRING,
            address: DataTypes.STRING,
            custodian: DataTypes.STRING,
            balance: DataTypes.DECIMAL,
            balance_usd: DataTypes.DECIMAL,
            balance_update_timestamp: DataTypes.DATE
        },
        //common global model props
        modelProps('av_cold_storage_accounts', 'Cold storage transfers of the CryptX system')
    );

    AVColdStorageAccount.prototype.toWeb = function() {
        let json = this.toJSON();

        json.balance_update_timestamp = json.balance_update_timestamp ? json.balance_update_timestamp.getTime() : json.balance_update_timestamp;

        return json;
    }

    return AVColdStorageAccount;
};
