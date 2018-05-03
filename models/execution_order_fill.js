'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrderFill = sequelize.define(
        'ExecutionOrderFill',
        {
            filled_quantity: DataTypes.DECIMAL,
            fill_timestamp: DataTypes.DATE
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