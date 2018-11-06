'use strict';

module.exports = (sequelize, DataTypes) => {
    let AVExchangeAccount = sequelize.define(
        'AVExchangeAccount',
        {   
            exchange_id: DataTypes.INTEGER,
            exchange: DataTypes.STRING,
            asset_id: DataTypes.INTEGER,
            asset: DataTypes.STRING,
            address: DataTypes.STRING,
            is_active: DataTypes.STRING
        },
        //common global model props
        modelProps('av_exchange_accounts', 'Exchange account view')
    );

    return AVExchangeAccount;
};
