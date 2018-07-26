"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVRecipeOrder = sequelize.define(
        "AVRecipeOrder",
        {
            recipe_run_id: DataTypes.SMALLINT,
            recipe_order_group_id: DataTypes.SMALLINT,
            investment_id: DataTypes.SMALLINT,
            instrument_id: DataTypes.SMALLINT,
            instrument: DataTypes.STRING,
            side: DataTypes.SMALLINT,
            target_exchange_id: DataTypes.SMALLINT,
            exchange: DataTypes.STRING,
            price: DataTypes.FLOAT,
            quantity: DataTypes.FLOAT,
            sum_of_exchange_trading_fee: DataTypes.FLOAT,
            status: DataTypes.SMALLINT,
            created_timestamp: DataTypes.DATE,
            completed_timestamp: DataTypes.DATE
        },
        //common global model props
        modelProps('av_recipe_orders', 'Recipe run order of the CryptX system')
    );

    AVRecipeOrder.prototype.toWeb = function () {
      
        let json = this.toJSON();

        json.created_timestamp = json.created_timestamp.getTime();
        json.completed_timestamp = json.completed_timestamp ? json.completed_timestamp.getTime() : json.completed_timestamp;

        return json;

    };

    return AVRecipeOrder;
};
