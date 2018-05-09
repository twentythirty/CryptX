'use strict';

module.exports = (sequelize, DataTypes) => {
    var RecipeOrder = sequelize.define(
        'RecipeOrder',
        {
            base_instrument_amount: DataTypes.DECIMAL,
            target_instrument_amount: DataTypes.DECIMAL,
            target_instrument_price: DataTypes.DECIMAL,
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            comment: DataTypes.TEXT('medium'),
            placed_timestamp: DataTypes.DATE
        },
        modelProps(
            'recipe_order',
            'This table describes orders generated for the running recipe'
        )
    );

    RecipeOrder.associate = function(models) {

        RecipeOrder.belongsTo(models.RecipeRun);
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
        RecipeOrder.belongsTo(models.User, {
            foreignKey: 'approve_user_id',
            as: 'approve_user'
        });
    };

    return RecipeOrder;
};