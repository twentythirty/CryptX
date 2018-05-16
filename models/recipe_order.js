'use strict';

module.exports = (sequelize, DataTypes) => {
    var RecipeOrder = sequelize.define(
        'RecipeOrder',
        {
            price: DataTypes.DECIMAL,
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
        RecipeOrder.belongsTo(models.Instrument, {
            foreignKey: 'base_instrument_id',
            as: 'base_instrument'
        });
        RecipeOrder.belongsTo(models.Instrument, {
            foreignKey: 'target_instrument_id',
            as: 'target_instrument'
        });
        RecipeOrder.belongsTo(models.Exchange, {
            foreignKey: 'target_exchange_id',
            as: 'target_exchange'
        });
    };

    return RecipeOrder;
};