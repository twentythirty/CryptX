'use strict';

module.exports = (sequelize, DataTypes) => {
    var PermissionsCategory = sequelize.define(
      "PermissionsCategory",
      {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
      },
      modelProps(
        "permissions_category",
        "Table that contains system categories of permissions to group them in UI"
      )
    );
  
    PermissionsCategory.associate = function(models) {
        PermissionsCategory.hasMany(models.Permission, {
            foreignKey: 'category_id'
        })
    };
  
    return PermissionsCategory;
  };