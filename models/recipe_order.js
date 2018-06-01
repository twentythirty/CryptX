'use strict';

module.exports = (sequelize, DataTypes) => {
    var RecipeOrder = sequelize.define(
        'RecipeOrder',
        {
            price: DataTypes.DECIMAL,
            quantity: DataTypes.DECIMAL,
            side: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false
            }
        },
        modelProps(
            'recipe_order',
            'This table describes orders generated for the running recipe'
        )
    );

    RecipeOrder.associate = function(models) {

        RecipeOrder.belongsTo(models.RecipeOrderGroup);
        RecipeOrder.belongsTo(models.Instrument);
    };

    return RecipeOrder;
};