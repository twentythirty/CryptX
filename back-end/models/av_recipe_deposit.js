"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVRecipeDeposit = sequelize.define(
        "AVRecipeDeposit",
        {   
            recipe_run_id: DataTypes.SMALLINT,
            investment_run_id: DataTypes.SMALLINT,
            quote_asset_id: DataTypes.SMALLINT,
            quote_asset: DataTypes.STRING,
            exchange_id: DataTypes.SMALLINT,
            exchange: DataTypes.STRING,
            account: DataTypes.STRING,
            amount: DataTypes.FLOAT,
            investment_percentage: DataTypes.FLOAT,
            deposit_management_fee: DataTypes.FLOAT,
            depositor_user: DataTypes.STRING,
            status: DataTypes.STRING
        },
        //common global model props
        modelProps('av_recipe_deposits', 'Recipe run deposit of the CryptX system')
    );

    return AVRecipeDeposit;
};
