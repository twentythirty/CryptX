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
            price: {
                type: DataTypes.DECIMAL,
                allowNull: true,
                defaultValue: null
            },
            total_quantity: DataTypes.DECIMAL,
            spend_amount: DataTypes.DECIMAL,
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
            },
            failed_attempts: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            fee: {
                type: DataTypes.DECIMAL,
                allowNull: true,
                defaultValue: null
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
        /*ExecutionOrder.belongsToMany(models.ColdStorageAccount, {
            through: models.ColdStorageTransfer
        })*/
        ExecutionOrder.hasMany(models.ExecutionOrderFill);
    };

    ExecutionOrder.prototype.isActive = function() {

        const is_active = _.reduce([
            EXECUTION_ORDER_STATUSES.Pending,
            EXECUTION_ORDER_STATUSES.InProgress
        ], (accum, val) => accum || this.status == val, false)

        return is_active;
    }

    return ExecutionOrder;
};