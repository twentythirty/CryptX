'use strict';

module.exports = (sequelize, DataTypes) => {

    var MarketHistoryDetail = sequelize.define(
        'MarketHistoryDetail',
        {
            timestamp: DataTypes.DATE,
            price_usd: DataTypes.DECIMAL,
            market_cap_usd: DataTypes.DECIMAL,
            daily_volume_usd: DataTypes.DECIMAL,
            market_cap_percentage: DataTypes.DECIMAL,
            nvt_ratio: {
                type: DataTypes.DECIMAL,
                allowNull: true
            }
        },
        modelProps(
            'market_history_detail',
            'This table will contain market history retrieved from Coinmarketcap'
        )
    );

    MarketHistoryDetail.associate = function(models) {
        MarketHistoryDetail.belongsTo(models.Instrument);
    };


    return MarketHistoryDetail;
};