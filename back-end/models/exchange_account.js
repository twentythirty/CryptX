'use strict';

module.exports = (sequelize, DataTypes) => {

    var ExchangeAccount = sequelize.define(
        'ExchangeAccount',
        {
            address: DataTypes.STRING,
            account_type: DataTypes.SMALLINT,
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        modelProps(
            'exchange_account',
            'This table defines accounts available on each exchange'
        )
    );

     ExchangeAccount.associate = function(models) {
        ExchangeAccount.belongsTo(models.Exchange);
        ExchangeAccount.belongsTo(models.Asset);
     };


    return ExchangeAccount;
};