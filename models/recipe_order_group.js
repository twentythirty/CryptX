'use strict';

module.exports = (sequelize, DataTypes) => {

    var RecipeOrderGroup = sequelize.define(
        'RecipeOrderGroup',
        {
            created_timestamp: DataTypes.DATE,
            approval_status: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            approval_timestamp: DataTypes.DATE,
            approval_comment: DataTypes.TEXT('medium')
        },
        modelProps(
            'recipe_order_group',
            'This table contains group info of individual recipe orders'
        )
    );

    RecipeOrderGroup.associate = function(models) {
    
        RecipeOrderGroup.belongsTo(models.User, {
            as: 'approval_user',
            foreignKey: 'approval_user_id'
        });
        RecipeOrderGroup.belongsTo(models.RecipeRun);
    };

    return RecipeOrderGroup;
};