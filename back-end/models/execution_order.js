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
            EXECUTION_ORDER_STATUSES.Placed,
            EXECUTION_ORDER_STATUSES.PartiallyFilled
        ], (accum, val) => accum || this.status == val, false)

        return is_active;
    }

    ExecutionOrder.beforeSave(async (exec_order, options) => {
        const ExecutionOrderFill = require('./index').ExecutionOrderFill;
        const sequelize = exec_order.sequelize;

        if(exec_order.type === EXECUTION_ORDER_TYPES.Market) {

            const [ err, result ] = await to(ExecutionOrderFill.findAll({
                where: { execution_order_id: exec_order.id },
                attributes: [ [sequelize.fn('AVG', sequelize.col('price')), 'average_price'] ],
                group: ['execution_order_id']
            }));

            if(err) TE(err.message);

            let average_price;
            if(result[0]) average_price = result[0].get('average_price');
    
            if(average_price) exec_order.price = average_price
        }

    });


    return ExecutionOrder;
};