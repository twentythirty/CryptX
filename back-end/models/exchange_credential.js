'use strict';

const EncryptedField = require('sequelize-encrypted');

module.exports = (sequelize, DataTypes) => {

    const encrypted_api_key_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);
    const encrypted_api_secret_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);
    const encrypted_admin_password_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);

    const ExchangeCredential = sequelize.define(
        'ExchangeCredential',
        {
            api_key: encrypted_api_key_field.vault('api_key'),
            api_key_string: encrypted_api_key_field.field('api_key_string', {
                type: DataTypes.STRING,
                allowNull: false
            }),
            api_secret: encrypted_api_secret_field.vault('api_secret'),
            api_secret_string: encrypted_api_secret_field.field('api_secret_string', {
                type: DataTypes.STRING,
                allowNull: false
            }),
            admin_password: encrypted_admin_password_field.vault('admin_password'),
            admin_password_string: encrypted_admin_password_field.field('admin_password_string', {
                type: DataTypes.STRING,
                allowNull: true
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

        json = _.omit(json, ['api_secret', 'api_secret_string', 'admin_password', 'admin_password_string']);

        return json;
    };

    return ExchangeCredential;
};
