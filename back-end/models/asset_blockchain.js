'use strict';

module.exports = (sequelize, DataTypes) => {
    var AssetBlockchain = sequelize.define(
        'AssetBlockchain',
        {
            coinmarketcap_identifier: {
                type: DataTypes.STRING,
                unique: false,
                allowNull: false
            }
        },
        modelProps(
            'asset_blockchain',
            'This table stores coinmarketcap.com-specific info about imported instruments'
        )
    );

    AssetBlockchain.associate = function(models) {
        AssetBlockchain.belongsTo(models.Asset);
    }

    return AssetBlockchain;
};