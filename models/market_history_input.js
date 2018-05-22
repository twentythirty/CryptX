'use strict';

module.exports = (sequelize, DataTypes) => {

    var AssetMarketCapitalization = sequelize.define(
        'AssetMarketCapitalization',
        {
            timestamp: DataTypes.DATE,
            capitalization_usd: DataTypes.DECIMAL,
            market_share_percentage: DataTypes.DECIMAL
        },
        modelProps(
            'asset_market_capitalization',
            'This table will contain market history retrieved from Coinmarketcap'
        )
    );

    AssetMarketCapitalization.associate = function(models) {
        AssetMarketCapitalization.belongsTo(models.Asset);
    };


    return AssetMarketCapitalization;
};