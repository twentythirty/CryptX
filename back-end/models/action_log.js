"use strict";

module.exports = (sequelize, DataTypes) => {
  var ActionLog = sequelize.define(
    "ActionLog",
    {
      timestamp: DataTypes.DATE,
      details: {
        type: DataTypes.TEXT("long"),
        allowNull: true
      },
      level: {
        type: DataTypes.SMALLINT,
        defaultValue: ACTIONLOG_LEVELS.Info
      },
      translation_key: {
        type: DataTypes.STRING,
        allowNull: true
      },
      translation_args: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    modelProps(
      "action_log",
      "Loosely-structured log of (noteworthy) actions performed in system"
    )
  );

  ActionLog.associate = function(models) {
    ActionLog.belongsTo(models.User, {
      foreignKey: "performing_user_id",
      as: "performing_user"
    });
    ActionLog.belongsTo(models.UserSession);
    ActionLog.belongsTo(models.User);
    ActionLog.belongsTo(models.Permission);
    ActionLog.belongsTo(models.Role);
    ActionLog.belongsTo(models.Asset);
    ActionLog.belongsTo(models.Instrument);
    ActionLog.belongsTo(models.Exchange);
    ActionLog.belongsTo(models.ExchangeAccount);
    ActionLog.belongsTo(models.InvestmentRun);
    ActionLog.belongsTo(models.RecipeRun);
    ActionLog.belongsTo(models.RecipeRunDeposit);
    ActionLog.belongsTo(models.RecipeOrder);
    ActionLog.belongsTo(models.ExecutionOrder);
    ActionLog.belongsTo(models.ColdStorageTransfer);
  };

  ActionLog.prototype.toWeb = function() {
    let json = this.toJSON();

    if(_.isString(json.translation_args)) json.translation_args = JSON.parse(json.translation_args);
    json.timestamp = json.timestamp ? json.timestamp.getTime() : json.timestamp;

    if(json.translation_key) {
      json.translationKey = json.translation_key;
      delete json.translation_key;
  
      json.translationArgs = json.translation_args;
      delete json.translation_args;

      delete json.details;
    }
    else {
      delete json.translation_key;
      delete json.translation_args;
    }

    return json;
  }

  return ActionLog;
};
