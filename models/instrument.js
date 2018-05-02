'use strict';

module.exports = (sequelize, DataTypes) => {

    var Instrument = sequelize.define(
        'Instrument',
        {
            symbol: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            long_name: DataTypes.STRING,
            is_base: DataTypes.BOOLEAN,
            is_blacklisted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            tick_size: DataTypes.DECIMAL
        },
        modelProps(
            'instrument',
            'Tradable instrument (symbol)'
        )
    );

    Instrument.associate = function(models) {
        Instrument.belongsToMany(models.Exchange, {
            through: models.SymbolExchangeMapping
        });
    }

    return Instrument;
};