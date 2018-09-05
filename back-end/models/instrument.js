'use strict';

module.exports = (sequelize, DataTypes) => {

    var Instrument = sequelize.define(
        'Instrument', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            symbol: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        modelProps(
            'instrument',
            'This table describes trading pairs used in exchanges'
        )
    );

    Instrument.associate = function(models) {

        Instrument.belongsTo(models.Asset, {
            as: 'transaction_asset',
            through: 'transaction_asset_id'
        });
        Instrument.belongsTo(models.Asset, {
            as: 'quote_asset',
            through: 'quote_asset_id'
        });
        Instrument.hasMany(models.InstrumentExchangeMapping);
    };

    Instrument.prototype.reverse_symbol = () => {

        const symbol = this.symbol;
        //if symbol is null/undefined/not string we return it as is
        if (symbol == null || !_.isString(symbol)) {
            return symbol;
        }
        const SYMBOL_SEPARATOR = '/';

        const [tx_asset, quote_asset] = symbol.split(SYMBOL_SEPARATOR); 

        return _.join([quote_asset, tx_asset], SYMBOL_SEPARATOR);
    }

    return Instrument;
};