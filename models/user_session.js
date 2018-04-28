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

  /**
   * refresh user session timeout by adding to the expiry time. persists change
   */
  UserSession.prototype.touch = function() {

    //JWT_EXPIRATION is measured in seconds
    this.expiry_timestamp = new Date(this.expiry_timestamp.getTime() + process.env.JWT_EXPIRATION * 1000)
    this.save();
  }

  return UserSession;
};
