"use strict";

module.exports = (sequelize, DataTypes) => {
    let AVRecipeOrdersGroup = sequelize.define(
        "AVRecipeOrdersGroup",
        {
            created_timestamp: DataTypes.DATE,
            status: DataTypes.STRING,
            approval_user: DataTypes.STRING,
            approval_comment: DataTypes.STRING 
        },
        //common global model props
        modelProps('av_recipe_order_groups', 'Recipe run order groups of the CryptX system')
    );

    AVRecipeOrdersGroup.prototype.toWeb = function () {
      
        let json = this.toJSON();
        json.created_timestamp = json.created_timestamp.getTime();
        return json;

    };

    return AVRecipeOrdersGroup;
};
