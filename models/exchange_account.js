'use strict';

module.exports = (sequelize, DataTypes) => {

    var ExchangeAccount = sequelize.define(
        'ExchangeAccount',
        {
            external_identifier: DataTypes.STRING
        },
        modelProps(
            'exchange_account',
            'This table defines accounts available on each exchange'
        )
    );

     ExchangeAccount.associate = function(models) {
        ExchangeAccount.belongsTo(models.Exchange);
        ExchangeAccount.belongsTo(models.Instrument);
     };


    return ExchangeAccount;
};