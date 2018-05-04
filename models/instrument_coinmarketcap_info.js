'use strict';

module.exports = (sequelize, DataTypes) => {
    var InstrumentCoinMarketCapInfo = sequelize.define(
        'InstrumentCoinMarketCapInfo',
        {
            coinmarketcap_id: {
                type: DataTypes.INTEGER,
                unique: true,
                allowNull: false
            }
        },
        modelProps(
            'instrument_coinmarketcap_info',
            'This table stores coinmarketcap.com-specific info about imported instruments'
        )
    );

    InstrumentCoinMarketCapInfo.associate = function(models) {
        InstrumentCoinMarketCapInfo.belongsTo(models.Instrument);
    }

    return InstrumentCoinMarketCapInfo;
};