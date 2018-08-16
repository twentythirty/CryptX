"use strict";

const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  var UserSession = sequelize.define(
    "UserSession", {
      token: DataTypes.STRING,
      expiry_timestamp: DataTypes.DATE,
      ip_address: DataTypes.STRING
    },
    modelProps(
      "user_session",
      "User`s session that is identified by an authentication token"
    )
  );

  UserSession.associate = function (models) {
    UserSession.belongsTo(models.User, {
      as: "user"
    });
  };

  /**
   * refresh user session timeout by adding to the expiry time. persists change
   */
  UserSession.prototype.touch = async function () {

    //JWT_EXPIRATION is measured in seconds
    this.expiry_timestamp = new Date(new Date().getTime() + CONFIG.jwt_expiration * 1000)
    //if singre-request-token measures are enabled, we refresh the token on every request
    if (CONFIG.jwt_use_srt) {
      const new_token = `Bearer ${jwt.sign(
        {
          user_id: this.user_id
        },
        CONFIG.jwt_encryption,
        {
          expiresIn: parseInt(process.env.JWT_EXPIRATION)
        }
      )}`
      this.token = new_token
    }
    this.save();
  }

  return UserSession;
};