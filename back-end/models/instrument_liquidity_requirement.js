'use strict';

module.exports = (sequelize, DataTypes) => {
    var InstrumentLiquidityRequirement = sequelize.define(
        'InstrumentLiquidityRequirement',
        {
            minimum_volume: DataTypes.DECIMAL,
            periodicity_in_days: DataTypes.INTEGER
        },
        modelProps(
            'instrument_liquidity_requirement',
            'This table is used to define minimum liquidity requirements for exchanges'
        )
    );

    InstrumentLiquidityRequirement.associate = function(models) {
        InstrumentLiquidityRequirement.belongsTo(models.Instrument);
    }

    return InstrumentLiquidityRequirement;
};