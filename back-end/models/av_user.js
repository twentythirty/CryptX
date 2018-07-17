"use strict";

module.exports = (sequelize, DataTypes) => {
  var AVUser = sequelize.define(
    "AVUser",
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      created_timestamp: DataTypes.DATE,
      is_active: {
        type: DataTypes.STRING,
        allowNull: false,
        defualValue: 'users.entity.active'
      }
    },
    //common global model props
    modelProps('av_users', 'User of the CryptX system')
  );

  return AVUser;
};
