'use strict';

module.exports = (sequelize, DataTypes) => {

    var AssetStatusChange = sequelize.define(
        'AssetStatusChange', {
            timestamp: DataTypes.DATE,
            comment: {
                type: DataTypes.TEXT('medium'),
                allowNull: true
            },
            type: DataTypes.SMALLINT
        },
        modelProps(
            'asset_status_change',
            'This table describes changes that ocurred to instrument availability'
        )
    );

    AssetStatusChange.associate = function(models) {

        AssetStatusChange.belongsTo(models.Asset);
        AssetStatusChange.belongsTo(models.User);
    };

    return AssetStatusChange;
};