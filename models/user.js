"use strict";
const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define(
    "User",
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Email invalid."
          }
        }
      },
      password: DataTypes.STRING,
      created_timestamp: DataTypes.DATE,
      reset_password_token_hash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reset_password_token_expiry_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defualValue: true
      }
    },
    //common global model props
    modelProps('user', 'User of the CryptX system')
  );

  User.associate = function(models) {
    User.belongsToMany(models.Role, {
      through: "user_role",
      timestamps: false
    });
  };

  User.beforeSave(async (user, options) => {
    let err;
    if (user.changed("password")) {
      let salt, hash;
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message);

      [err, hash] = await to(bcrypt.hash(user.password, salt));
      if (err) TE(err.message);

      user.password = hash;
    }
  });

  User.prototype.comparePassword = async function(pw) {
    let err, pass;
    if (!this.password) TE("password not set");

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE("invalid password");

    return this;
  };

  User.prototype.getJWT = function() {
    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return (
      "Bearer " +
      jwt.sign(
        {
          user_id: this.id
        },
        CONFIG.jwt_encryption,
        {
          expiresIn: expiration_time
        }
      )
    );
  };

  User.prototype.toWeb = function() {
    let json = this.toJSON();
    delete json.password;
    return json;
  };

  return User;
};
