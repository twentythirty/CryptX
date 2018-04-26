"use strict";

module.exports = (sequelize, DataTypes) => {
  var UserSession = sequelize.define(
    "UserSession",
    {
      token: DataTypes.STRING,
      expiry_timestamp: DataTypes.DATE,
      ip_address: DataTypes.STRING
    },
    modelProps(
      "user_session",
      "User`s session that is identified by an authentication token"
    )
  );

  UserSession.associate = function(models) {
    UserSession.belongsTo(models.User, { as: "user" });
  };

  return UserSession;
};
