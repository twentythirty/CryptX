'use strict';

module.exports = (sequelize, DataTypes) => {
    var ExecutionOrderFill = sequelize.define(
        'ExecutionOrderFill',
        {
            timestamp: DataTypes.DATE,
            quantity: DataTypes.DECIMAL,
            fee: {
                type: DataTypes.DECIMAL,
                allowNull: false,
                defaultValue: 0.0
            },
            fee_asset_symbol: {
                type: DataTypes.STRING,
                allowNull: true
            },
            price: DataTypes.DECIMAL,
            external_identifier: DataTypes.STRING
        },
        modelProps(
            'execution_order_fill',
            'This table describes the filling state of an execution order'
        )
    );

    ExecutionOrderFill.associate = function(models) {

        ExecutionOrderFill.belongsTo(models.ExecutionOrder);
        ExecutionOrderFill.belongsTo(models.Asset, {
            as: 'fee_asset',
            through: 'fee_asset_id'
        });
    };

    ExecutionOrderFill.beforeSave(async (fill, options) => {
        return beforeSave(fill, options);
    });

    ExecutionOrderFill.beforeCreate(async (fill, options) => {
        return beforeSave(fill, options);
    });

    ExecutionOrderFill.beforeBulkCreate(async (fills, options) => {
        let hooks = [];
        for(let fill of fills) {
            hooks.push(beforeSave(fill, options));
        }
        return Promise.all(hooks);
    });

    async function beforeSave(fill, options) {
        const Asset = require('./index').Asset;
        const sequelize = fill.sequelize;

        if(fill.fee_asset_symbol && !fill.fee_asset_id) {
            const [ err, asset ] = await to(Asset.findOne({
                where: { symbol: fill.fee_asset_symbol }
            }));

            if(err) TE(err.message);

            if(asset) fill.fee_asset_id = asset.id;
        }
        
        else if(!fill.fee_asset_symbol && fill.fee_asset_id) {
            const [ err, asset ] = await to(Asset.findById(fill.fee_asset_id));

            if(err) TE(err.message);

            if(asset) fill.fee_asset_symbol = asset.symbol;
        }
    }

    return ExecutionOrderFill;
};