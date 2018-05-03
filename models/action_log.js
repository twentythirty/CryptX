"use strict";

module.exports = (sequelize, DataTypes) => {
  var ActionLog = sequelize.define(
    "ActionLog",
    {
      timestamp: DataTypes.DATE,
      details: {
        type: DataTypes.TEXT("medium"),
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
    ActionLog.belongsTo(models.Instrument);
    ActionLog.belongsTo(models.Exchange);
    ActionLog.belongsTo(models.ExchangeAccount);
    ActionLog.belongsTo(models.InvestmentRun);
  };

  return ActionLog;
};
