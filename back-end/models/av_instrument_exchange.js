"use strict";

module.exports = (sequelize, DataTypes) => {
    var AVInstrumentExchange = sequelize.define(
        "AVInstrumentExchange",
        {
            instrument_id: { 
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            exchange_id: { 
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            exchange_name: DataTypes.STRING,
            external_instrument: DataTypes.STRING,
            current_price: DataTypes.DECIMAL,
            last_day_vol: DataTypes.DECIMAL,
            last_week_vol: DataTypes.DECIMAL,
            last_updated: DataTypes.DATE
        },
        //common global model props
        modelProps('av_instruments_exchanges', 'Instruments exchanges mappings of the CryptX system')
    );

    return AVInstrumentExchange;
};
