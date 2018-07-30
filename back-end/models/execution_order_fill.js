'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrderFill = sequelize.define(
        'ExecutionOrderFill',
        {
            fill_timestamp: DataTypes.DATE,
            filled_quantity: DataTypes.DECIMAL,
            //price: DataTypes.DECIMAL,
            external_identifier: DataTypes.STRING,
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