'use strict';

const EncryptedField = require('sequelize-encrypted');

module.exports = (sequelize, DataTypes) => {

    const encrypted_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);

    const ExchangeCredential = sequelize.define(
        'ExchangeCredential',
        {
            api_user_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            api_password: encrypted_field.vault('api_password'),
            password: encrypted_field.field('password', {
                type: DataTypes.STRING,
                allowNull: false
            })
        },
        modelProps(
            'exchange_credential',
            'This table contains exchange credentials of the exchange APIs'
        )
    );

    ExchangeCredential.associate = function (models) {
        ExchangeCredential.belongsTo(models.Exchange);
    };

    ExchangeCredential.prototype.toWeb = function () {
        
        let json = this.toJSON();

        json = _.omit(json, ['api_password', 'password']);

        return json;
    };

    return ExchangeCredential;
};
