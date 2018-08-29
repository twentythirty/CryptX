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
            exchange_pass: DataTypes.SMALLINT,
            exchange_not_pass: {
                type: DataTypes.VIRTUAL,
                get: function() {
                    if(_.isNull(this.exchange_count) || _.isNull(this.exchange_pass)) return null;
                    let not_pass = this.exchange_count - this.exchange_pass;
                    if(not_pass < 0) not_pass = 0;
                    return String(not_pass);  //Converts to because FE does not display number 0
                }
            }
        },
        //common global model props
        modelProps('av_instrument_liquidity_requirements', 'Liquidity requirements of the CryptX system')
    );

    return AVInstrumentLiquidityRequirement;
};
