'use strict';

module.exports = (sequelize, DataTypes) => {

    var MarketHistoryInput = sequelize.define(
        'MarketHistoryInput',
        {
            timestamp: DataTypes.DATE,
            price_usd: DataTypes.DECIMAL,
            market_cap_usd: DataTypes.DECIMAL,
            daily_volume_usd: DataTypes.DECIMAL,
            market_cap_percentage: DataTypes.DECIMAL
        },
        modelProps(
            'market_history_input',
            'This table will contain market history retrieved from Coinmarketcap'
        )
    );

    MarketHistoryInput.associate = function(models) {
        MarketHistoryInput.belongsTo(models.Instrument);
    };


    return MarketHistoryInput;
};