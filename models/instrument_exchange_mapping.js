"use strict";

module.exports = (sequelize, DataTypes) => {

    var InstrumentExchangeMapping = sequelize.define(
        'InstrumentExchangeMapping',
        {
            external_instrument_id: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        modelProps(
            'symbol_exchange_mapping',
            'This table determines which instruments are available on which exchange'
        )
    );

    return InstrumentExchangeMapping;
};