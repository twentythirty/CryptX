"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVExecutionOrder = sequelize.define(
        "AVExecutionOrder",
        {   
            investment_run_id: DataTypes.INTEGER,
            recipe_order_id: DataTypes.INTEGER,
            instrument_id: DataTypes.INTEGER,
            instrument: DataTypes.STRING,
            side: DataTypes.SMALLINT,
            exchange_id: DataTypes.INTEGER,
            exchange: DataTypes.STRING,
            type: DataTypes.SMALLINT,
            price: DataTypes.DECIMAL,
            total_quantity: DataTypes.DECIMAL,
            filled_quantity: DataTypes.DECIMAL,
            exchange_trading_fee: DataTypes.DECIMAL,
            status: DataTypes.SMALLINT,
            submission_time: DataTypes.DATE,
            completion_time: DataTypes.DATE
        },
        //common global model props
        modelProps('av_execution_orders', 'Execution orders of the CryptX system')
    );

    AVExecutionOrder.prototype.toWeb = function () {
      
        let json = this.toJSON();

        json.submission_time = json.submission_time ? json.submission_time.getTime() : json.submission_time;
        json.completion_time = json.completion_time ? json.completion_time.getTime() : json.completion_time;

        return json;

    };

    return AVExecutionOrder;
};
