"use strict";

module.exports = (sequelize, DataTypes) => {
    var AVRecipeRun = sequelize.define(
        "AVRecipeRun",
        {
            investment_run_id: DataTypes.INTEGER,
            created_timestamp: DataTypes.DATE,
            approval_status: DataTypes.STRING,
            approval_comment: DataTypes.STRING,
            approval_timestamp: DataTypes.DATE,
            user_created_id: DataTypes.INTEGER,
            user_created: DataTypes.STRING,
            approval_user_id: DataTypes.INTEGER,
            approval_user: DataTypes.STRING
        },
        //common global model props
        modelProps('av_recipe_runs', 'Recipe runs of the CryptX system')
    );

    AVRecipeRun.prototype.toWeb = function () {
        let json = this.toJSON();

        json.created_timestamp = json.created_timestamp.getTime();
        json.approval_timestamp = (json.approval_timestamp != null ? json.approval_timestamp.getTime() : json.approval_timestamp);

        return json;
    };

    return AVRecipeRun;
};
