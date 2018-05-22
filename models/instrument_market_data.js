'use strict'

module.exports = (sequelize, DataTypes) => {
    var InstrumentMarketData = sequelize.define(
        'InstrumentMarketData', {
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false
            },
            ask_price: DataTypes.DECIMAL,
            bid_price: DataTypes.DECIMAL
        },
        modelProps(
            'instrument_market_data',
            'Market data gethered from exchanges for specific trading pairs (instruments)'
        )
    );

    InstrumentMarketData.associate = function (models) {
        InstrumentMarketData.belongsTo(models.Instrument);
        InstrumentMarketData.belongsTo(models.Exchange);
    }

    return InstrumentMarketData;
};