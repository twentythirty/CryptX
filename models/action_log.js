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
    //TODO: associate


  };

  return ActionLog;
};
