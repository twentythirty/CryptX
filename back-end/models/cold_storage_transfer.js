"use strict";

module.exports = (sequelize, DataTypes) => {
  var ColdStorageTransfer = sequelize.define(
    "ColdStorageTransfer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
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
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      fee: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      external_identifier: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    modelProps(
      "cold_storage_transfer",
      "This table connects cold storage accounts with recipe orders that deposit into them"
    )
  );

  ColdStorageTransfer.associate = function (models) {

    ColdStorageTransfer.belongsTo(models.RecipeOrder, {
      foreignKey: 'recipe_run_order_id'
    });
    ColdStorageTransfer.belongsTo(models.Asset);
    ColdStorageTransfer.belongsTo(models.ColdStorageAccount)
    ColdStorageTransfer.belongsTo(models.RecipeRun, {
      foreignKey: 'recipe_run_id'
    });
  };

  ColdStorageTransfer.prototype.setAmountMultipleOf = function(multiple_of) {

    if(_.isString(multiple_of)) multiple_of = parseFloat(multiple_of);

    const new_amount = Math.floor(parseFloat(this.amount)/multiple_of) * multiple_of;

    return this.setAmount(new_amount, 'multiple_of', multiple_of);

  };

  ColdStorageTransfer.prototype.setAmount = function(new_amount, reason, info_value) {

    const { logAction } = require('../utils/ActionLogUtil');

    const old_amount = this.amount;
    this.amount = new_amount;

    return logAction(`cold_storage_transfers.new_amount.${reason}`, {
      args: {
        old_amount, new_amount, info_value
      },
      relations: {
        cold_storage_transfer_id: this.id
      },
      log_level: ACTIONLOG_LEVELS.Warning
    });

  };

  ColdStorageTransfer.prototype.getWithdrawParams = function() {

    return {
      asset_symbol: this.getDataValue('asset'),
      amount: this.amount,
      address: this.getDataValue('address'),
      tag: this.getDataValue('tag'),
      fee: this.fee
    };

  }

  return ColdStorageTransfer;
};
