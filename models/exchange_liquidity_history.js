'use strict';

module.exports = (sequelize, DataTypes) => {

    var ExchangeLiquidityHistory = sequelize.define(
        'ExchangeLiquidityHistory',
        {
            date: DataTypes.DATE,
            volume: DataTypes.DECIMAL
        },
        modelProps(
            'exchange_liquidity_history',
            'This table contains history of currency pair liquidity in exchange'
        )
    );

    ExchangeLiquidityHistory.associate = function(models) {

        ExchangeLiquidityHistory.belongsTo(models.Exchange);
        ExchangeLiquidityHistory.belongsTo(models.Instrument, {
            as: 'base_instrument',
            foreignKey: 'base_instrument_id'
        });
        ExchangeLiquidityHistory.belongsTo(models.Instrument, {
            as: 'target_instrument',
            foreignKey: 'target_instrument_id'
        });
    };
    

    return ExchangeLiquidityHistory;
};