"use strict";

module.exports = (sequelize, DataTypes) => {
  var RecipeRunDeposit = sequelize.define(
    "RecipeRunDeposit",
    {
      creation_timestamp: DataTypes.DATE,
      amount: DataTypes.DECIMAL,
      fee: DataTypes.DECIMAL,
      completion_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false
      }
    },
    modelProps("recipe_run_deposit", "Funds deposited for investing during single investment run")
  );

  RecipeRunDeposit.associate = function(models) {
    RecipeRunDeposit.belongsTo(models.Asset);
    RecipeRunDeposit.belongsTo(models.RecipeRun);
    RecipeRunDeposit.belongsTo(models.User, {
      as: 'depositor_user',
      foreignKey: 'depositor_user_id'
    });
    RecipeRunDeposit.belongsTo(models.ExchangeAccount, {
      as: 'target_exchange_account',
      foreignKey: 'target_exchange_account_id'
    })
  };

  RecipeRunDeposit.prototype.toWeb = function() {

    let json = this.toJSON();

    json.creation_timestamp = json.creation_timestamp ? json.creation_timestamp.getTime() : json.creation_timestamp;
    json.completion_timestamp = json.completion_timestamp ? json.completion_timestamp.getTime() : json.completion_timestamp;
    json.status = `deposits.status.${json.status}`;

    return json;

  };

  return RecipeRunDeposit;
};
