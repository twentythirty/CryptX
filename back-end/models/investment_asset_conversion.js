"use strict";

module.exports = (sequelize, DataTypes) => {
    var InvestmentAssetConversion = sequelize.define(
        "InvestmentAssetConversion",
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            created_timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Date.now
            },
            completed_timestamp: {
                type: DataTypes.DATE,
                allowNull: true
            },
            amount: {
                type: DataTypes.DECIMAL,
                allowNull: true
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: ASSET_CONVERSION_STATUSES.Pending
            }
        },
        modelProps(
            "investment_asset_conversion",
            "Conversion of assets for a recipe run"
        )
    );

    InvestmentAssetConversion.associate = function (models) {
        InvestmentAssetConversion.belongsTo(models.Asset, {
            as: 'investment_asset',
            through: 'investment_asset_id'
        });
        InvestmentAssetConversion.belongsTo(models.Asset, {
            as: 'target_asset',
            through: 'target_asset_id'
        });
        InvestmentAssetConversion.belongsTo(models.RecipeRun);
        InvestmentAssetConversion.belongsTo(models.User, {
            as: 'depositor_user',
            through: 'depositor_user_id'
        })
    };

    return InvestmentAssetConversion;
};
