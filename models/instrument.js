'use strict';

module.exports = (sequelize, DataTypes) => {

    var Instrument = sequelize.define(
        'Instrument',
        {
            symbol: {
                type: DataTypes.STRING,
                unique: false,
                allowNull: false
            },
            long_name: DataTypes.STRING,
            is_base: DataTypes.BOOLEAN
        },
        modelProps(
            'instrument',
            'Tradable instrument (symbol)'
        )
    );

    Instrument.associate = function(models) {
        Instrument.belongsToMany(models.Exchange, {
            through: models.InstrumentExchangeMapping
        });
    }

    return Instrument;
};