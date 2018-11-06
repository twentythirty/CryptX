"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVColdStorageTransfer = sequelize.define(
        "AVColdStorageTransfer",
        {   
            asset_id: DataTypes.INTEGER,
            asset: DataTypes.STRING,
            gross_amount: DataTypes.DECIMAL,
            net_amount: DataTypes.DECIMAL,
            exchange_withdrawal_fee: DataTypes.DECIMAL,
            status: DataTypes.STRING,
            destination_account: DataTypes.STRING,
            custodian: DataTypes.STRING,
            strategy_type: DataTypes.STRING,
            source_exchange: DataTypes.STRING,
            source_account: DataTypes.STRING,
            placed_timestamp: DataTypes.DATE,
            completed_timestamp: DataTypes.DATE,
            recipe_run_id: DataTypes.INTEGER
        },
        //common global model props
        modelProps('av_cold_storage_transfers', 'Cold storage transfers of the CryptX system')
    );

    AVColdStorageTransfer.prototype.toWeb = function() {
        let json = this.toJSON();

        json.placed_timestamp = json.placed_timestamp ? json.placed_timestamp.getTime() : json.placed_timestamp;
        json.completed_timestamp = json.completed_timestamp ? json.completed_timestamp.getTime() : json.completed_timestamp;

        return json;
    }

    return AVColdStorageTransfer;
};
