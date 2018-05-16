'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrder = sequelize.define(
        'ExecutionOrder', {
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            type: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            price: DataTypes.DECIMAL,
            total_quantity: DataTypes.DECIMAL,
            placed_timestamp: DataTypes.DATE,
            completed_timestamp: DataTypes.DATE
        },
        modelProps(
            'execution_order',
            'This table describes individual trade action orders generated from recipe order'
        )
    );

    ExecutionOrder.associate = function (models) {
        ExecutionOrder.belongsTo(models.RecipeOrder);
        ExecutionOrder.belongsToMany(models.ColdStorageAccount, {
            through: models.ColdStorageOrder
        })
    };


    return ExecutionOrder;
};