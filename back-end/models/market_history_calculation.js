'use strict';

module.exports = (sequelize, DataTypes) => {

    var MarketHistoryCalculation = sequelize.define(
        'MarketHistoryCalculation',
        {
            timestamp: DataTypes.DATE,
            type: DataTypes.SMALLINT,
            value: DataTypes.DECIMAL
        },
        modelProps(
            'market_history_calculation',
            'This table will contain calculated data based on received stuff from Coinmarketcap'
        )
    );

    MarketHistoryCalculation.associate = function(models) {
        MarketHistoryCalculation.belongsTo(models.Asset);
    };


    return MarketHistoryCalculation;
};