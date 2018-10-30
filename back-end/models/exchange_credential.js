'use strict';

const EncryptedField = require('sequelize-encrypted');

module.exports = (sequelize, DataTypes) => {

    const encrypted_api_key_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);
    const encrypted_api_secret_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);
    const encrypted_additional_params_field = EncryptedField(DataTypes, process.env.DATABASE_FIELD_ENCRYPTION_KEY);

    const ExchangeCredential = sequelize.define(
        'ExchangeCredential',
        {
            api_key: encrypted_api_key_field.vault('api_key'),
            api_key_string: encrypted_api_key_field.field('api_key_string', {
                type: DataTypes.STRING,
                allowNull: true
            }),
            api_secret: encrypted_api_secret_field.vault('api_secret'),
            api_secret_string: encrypted_api_secret_field.field('api_secret_string', {
                type: DataTypes.STRING,
                allowNull: true
            }),
            additional_params: encrypted_additional_params_field.vault('additional_params'),
            additional_params_string: encrypted_additional_params_field.field('additional_params_string', {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: "{}",
                set: function(value) {
                    if(_.isPlainObject(value)) return JSON.stringify(value);
                },
                get: function(value) {
                    if(_.isString(value)) return JSON.parse(value);
                }
            }),
            updated: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
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
