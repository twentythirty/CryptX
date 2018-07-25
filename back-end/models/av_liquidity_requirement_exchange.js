"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVLiquidityRequirementExchange = sequelize.define(
        'AVLiquidityRequirementExchange',
        {
            exchange_id: DataTypes.SMALLINT,
            exchange: DataTypes.STRING,
            instrument_id: DataTypes.SMALLINT,
            instrument: DataTypes.STRING,
            instrument_identifier: DataTypes.STRING,
            current_price: DataTypes.FLOAT,
            last_day_vol: DataTypes.FLOAT,
            last_week_vol: DataTypes.FLOAT,
            last_updated: DataTypes.DATE,
            passes: DataTypes.BOOLEAN
        },
        //common global model props
        modelProps('av_liquidity_requirement_exchanges', 'Liquidity requirement exchanges of the CryptX system')
    );

    AVLiquidityRequirementExchange.prototype.toWeb = function () {
        let json = this.toJSON();

        json.last_updated = (json.last_updated != null ? json.last_updated.getTime() : json.last_updated);

        return json;
    };

    return AVLiquidityRequirementExchange;
};
