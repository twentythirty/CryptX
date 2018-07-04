'use strict';

module.exports = (sequelize, DataTypes) => {

    var InstrumentLiquidityHistory = sequelize.define(
        'InstrumentLiquidityHistory',
        {
            timestamp_from: DataTypes.DATE,
            timestamp_to: DataTypes.DATE,
            volume: DataTypes.DECIMAL
        },
        modelProps(
            'instrument_liquidity_history',
            'This table contains history of currency pair liquidity in exchange'
        )
    );

    InstrumentLiquidityHistory.associate = function(models) {

        InstrumentLiquidityHistory.belongsTo(models.Exchange);
        InstrumentLiquidityHistory.belongsTo(models.Instrument);
    };
    

    return InstrumentLiquidityHistory;
};