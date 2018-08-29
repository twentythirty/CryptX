"use strict";

module.exports = (sequelize, DataTypes) => {
    var AVInstrumentExchange = sequelize.define(
        "AVInstrumentExchange",
        {
            instrument_id: { 
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            exchange_id: { 
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            exchange_name: DataTypes.STRING,
            external_instrument: DataTypes.STRING,
            current_price: DataTypes.DECIMAL,
            last_day_vol: DataTypes.DECIMAL,
            last_week_vol: DataTypes.DECIMAL,
            last_updated: DataTypes.DATE
        },
        //common global model props
        modelProps('av_instruments_exchanges', 'Instruments exchanges mappings of the CryptX system')
    );

    AVInstrumentExchange.prototype.toWeb = async function() {
        const ccxtUtils = require('../utils/CCXTUtils');

        let json = this.toJSON();

        json.last_updated = json.last_updated ? json.last_updated.getTime() : json.last_updated;

        let [ err, connector ] = await to(ccxtUtils.getConnector(json.exchange_id));

        if(err) TE(err.message);

        json.external_instrument_list = _.uniq(
            _.flatten( 
                Object.keys(connector.markets)
            )
        );

        return json;
    }

    return AVInstrumentExchange;
};
