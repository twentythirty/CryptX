'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrderFill = sequelize.define(
        'ExecutionOrderFill',
        {
            timestamp: DataTypes.DATE,
            quantity: DataTypes.DECIMAL,
            price: DataTypes.DECIMAL
        },
        modelProps(
            'execution_order_fill',
            'This table describes the filling state of an execution order'
        )
    );

    ExecutionOrderFill.associate = function(models) {

        ExecutionOrderFill.belongsTo(models.ExecutionOrder);
    };

    return ExecutionOrderFill;
};