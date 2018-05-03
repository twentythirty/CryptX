'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrder = sequelize.define(
        'ExecutionOrder',
        {
            status: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: EXECUTION_ORDER_STATUSES
            },
            type: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: EXECUTION_ORDER_TYPES
            },
            total_quantity: DataTypes.DECIMAL,
            placed_timestamp: DataTypes.DATE,
            completed_timestamp: DataTypes.DATE
        },
        modelProps(
            'execution_order',
            'This table describes individual trade action orders generated from recipe order'
        )
    );

    ExecutionOrder.associate = function(models) {
        ExecutionOrder.belongsTo(models.InvestmentOrder);
        ExecutionOrder.belongsTo(models.Instrument);
    };


    return ExecutionOrder;
};