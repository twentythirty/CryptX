'use strict';

module.exports = (sequelize, DataTypes) => {
    var InvestmentOrder = sequelize.define(
        'InvestmentOrder',
        {
            base_instrument_amount: DataTypes.DECIMAL,
            target_instrument_amount: DataTypes.DECIMAL,
            target_instrument_price: DataTypes.DECIMAL,
            status: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: RECIPE_ORDER_STATUSES
            },
            comment: DataTypes.TEXT('medium'),
            placed_timestamp: DataTypes.DATE
        },
        modelProps(
            'recipe_order',
            'This table describes orders generated for the running recipe'
        )
    );

    InvestmentOrder.associate = function(models) {

        InvestmentOrder.belongsTo(models.RecipeRun);
        InvestmentOrder.belongsTo(models.Instrument, {
            foreignKey: 'base_instrument_id',
            as: 'base_instrument'
        });
        InvestmentOrder.belongsTo(models.Instrument, {
            foreignKey: 'target_instrument_id',
            as: 'target_instrument'
        });
        InvestmentOrder.belongsTo(models.Exchange, {
            foreignKey: 'target_exchange_id',
            as: 'target_exchange'
        });
        InvestmentOrder.belongsTo(models.User, {
            foreignKey: 'approve_user_id',
            as: 'approve_user'
        });

        InvestmentOrder.belongsToMany(models.ColdStorageAccount, {
            through: models.ColdStorageInvestmentOrder
        });
    };

    return InvestmentOrder;
};