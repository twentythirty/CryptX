"use strict";

module.exports = (sequelize, DataTypes) => {
    var AVRecipeRunDetail = sequelize.define(
        "AVRecipeRunDetail",
        {
            recipe_run_id: DataTypes.SMALLINT,
            transaction_asset_id: DataTypes.SMALLINT,
            transaction_asset: DataTypes.STRING,
            quote_asset_id: DataTypes.SMALLINT,
            quote_asset: DataTypes.STRING,
            target_exchange_id: DataTypes.SMALLINT,
            target_exchange: DataTypes.STRING,
            investment_percentage: DataTypes.FLOAT
        },
        //common global model props
        modelProps('av_recipe_run_details', 'Recipe run details of the CryptX system')
    );

    return AVRecipeRunDetail;
};
