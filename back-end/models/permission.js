"use strict";

module.exports = (sequelize, DataTypes) => {
  var Permission = sequelize.define(
    "Permission",
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      name: DataTypes.STRING
    },
    modelProps(
      "permission",
      "Table that contains all the permissions available in the system"
    )
  );

  Permission.associate = function(models) {
      Permission.belongsToMany(models.Role, {
          through: 'role_permission',
          timestamps: false
      });
  };

  return Permission;
};
