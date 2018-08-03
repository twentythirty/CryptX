"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVExecutionOrderFill = sequelize.define(
        "AVExecutionOrderFill",
        {   
            execution_order_id: DataTypes.INTEGER,
            fill_time: DataTypes.DATE,
            fill_price: DataTypes.DECIMAL,
            quantity: DataTypes.DECIMAL
        },
        //common global model props
        modelProps('av_execution_order_fills', 'Execution order fills of the CryptX system')
    );

    AVExecutionOrderFill.prototype.toWeb = function() {
        let json = this.toJSON();

        if (json.fill_time) {
            json.fill_time = json.fill_time.getTime();
        }
        return json;
    }

    return AVExecutionOrderFill;
};
