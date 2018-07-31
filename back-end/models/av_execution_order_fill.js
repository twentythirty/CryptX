"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVExecutionOrderFill = sequelize.define(
        "AVExecutionOrderFill",
        {   
            fill_time: DataTypes.DATE,
            fill_price: DataTypes.DECIMAL,
            quantity: DataTypes.DECIMAL
        },
        //common global model props
        modelProps('av_execution_order_fills', 'Execution order fills of the CryptX system')
    );

    return AVExecutionOrderFill;
};
