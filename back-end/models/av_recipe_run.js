"use strict";

module.exports = (sequelize, DataTypes) => {
    var AVRecipeRun = sequelize.define(
        "AVRecipeRun",
        {
            investment_run_id: DataTypes.SMALLINT,
            created_timestamp: DataTypes.DATE,
            approval_status: DataTypes.STRING,
            approval_comment: DataTypes.STRING,
            approval_timestamp: DataTypes.DATE,
            user_created_id: DataTypes.SMALLINT,
            user_created: DataTypes.STRING,
            approval_user_id: DataTypes.SMALLINT,
            approval_user: DataTypes.SMALLINT
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
