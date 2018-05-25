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
            as: 'base_asset',
            through: 'base_asset_id'
        });
        Instrument.belongsTo(models.Asset, {
            as: 'target_asset',
            through: 'target_asset_id'
        });
    };

    return Instrument;
};