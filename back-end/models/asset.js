'use strict';

const EmailUtil = require('../utils/EmailUtil');

module.exports = (sequelize, DataTypes) => {

    var Asset = sequelize.define(
        'Asset',
        {
            symbol: {
                type: DataTypes.STRING,
                unique: false,
                allowNull: false
            },
            long_name: DataTypes.STRING,
            is_base: DataTypes.BOOLEAN,
            is_deposit: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        modelProps(
            'asset',
            'Tradable asset (symbol)'
        )
    );

    Asset.associate = function(models) {
        Asset.belongsToMany(models.Exchange, {
            through: models.InstrumentExchangeMapping
        });
        Asset.hasMany(models.AssetStatusChange);
    }

    Asset.hook('afterCreate', function(asset, options) {
        EmailUtil.prepareNewAssetNotification(asset.toJSON());
    });

    return Asset;
};