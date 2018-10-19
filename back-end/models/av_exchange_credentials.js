'use strict';

module.exports = (sequelize, DataTypes) => {
    const AVExchangeCredential = sequelize.define(
        'AVExchangeCredential',
        {   
            exchange_id: DataTypes.INTEGER,
            exchange: DataTypes.STRING,
            username: DataTypes.STRING
        },
        //common global model props
        modelProps('av_exchange_credentials', 'Exchange credentials view')
    );

    return AVExchangeCredential;
};
