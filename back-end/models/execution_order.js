'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrder = sequelize.define(
        'ExecutionOrder', {
            external_identifier: {
                type: DataTypes.STRING,
                allowNull: true
            },
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
            placed_timestamp: {
                type: DataTypes.DATE,
                allowNull: true
            },
            completed_timestamp: {
                type: DataTypes.DATE,
                allowNull: true
            },
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