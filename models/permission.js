"use strict";

module.exports = (sequelize, DataTypes) => {
  var Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.ENUM,
        primaryKey: true,
        values: Object.keys(all_permissions)
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
          through: 'role_permission'
      });
  };

  return Permission;
};
