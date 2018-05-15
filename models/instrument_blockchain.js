'use strict';

module.exports = (sequelize, DataTypes) => {
    var InstrumentBlockchain = sequelize.define(
        'InstrumentBlockchain',
        {
            coinmarketcap_identifier: {
                type: DataTypes.STRING,
                unique: false,
                allowNull: false
            }
        },
        modelProps(
            'instrument_blockchain',
            'This table stores coinmarketcap.com-specific info about imported instruments'
        )
    );

    InstrumentBlockchain.associate = function(models) {
        InstrumentBlockchain.belongsTo(models.Instrument);
    }

    return InstrumentBlockchain;
};