'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrder = sequelize.define(
        'ExecutionOrder', {
            external_identifier: DataTypes.STRING,
            side: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            type: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            price: DataTypes.DECIMAL,
            total_quantity: DataTypes.DECIMAL,
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            placed_timestamp: DataTypes.DATE,
            completed_timestamp: DataTypes.DATE,
            time_in_force: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        modelProps(
            'execution_order',
            'This table describes individual trade action orders generated from recipe order'
        )
    );

    ExecutionOrder.associate = function (models) {
        ExecutionOrder.belongsTo(models.RecipeOrder);
        ExecutionOrder.belongsTo(models.Instrument);
        ExecutionOrder.belongsTo(models.Exchange);
        ExecutionOrder.belongsToMany(models.ColdStorageAccount, {
            through: models.ColdStorageTransfer
        })
    };


    return ExecutionOrder;
};