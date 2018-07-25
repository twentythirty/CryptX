"use strict";

module.exports = (sequelize, DataTypes) => {
    const AVInstrumentLiquidityRequirement = sequelize.define(
        'AVInstrumentLiquidityRequirement',
        {
            instrument_id: DataTypes.SMALLINT,
            instrument: DataTypes.STRING,
            periodicity: DataTypes.SMALLINT,
            quote_asset: DataTypes.STRING,
            minimum_circulation: DataTypes.FLOAT,
            exchange: DataTypes.STRING,
            exchange_count: DataTypes.SMALLINT,
            exchange_pass: DataTypes.SMALLINT
        },
        //common global model props
        modelProps('av_instrument_liquidity_requirements', 'Liquidity requirements of the CryptX system')
    );

    return AVInstrumentLiquidityRequirement;
};
