"use strict";

module.exports = (sequelize, DataTypes) => {

    var SymbolExchangeMapping = sequelize.define(
        'SymbolExchangeMapping',
        {
            external_instrument_id: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        modelProps(
            'symbol_exchange_mapping',
            'This table determines which instruments are available on which exchange'
        )
    );

    return SymbolExchangeMapping;
};