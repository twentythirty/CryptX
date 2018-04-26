"use strict";

module.exports = (sequelize, DataTypes) => {

    var Role = sequelize.define(
        'Role',
        {
            name: DataTypes.STRING
        },
        modelProps(
            'role',
            'Table that contains all the roles available in the system'
        )
    );

    Role.associate = function(models) {
        Role.belongsToMany(models.Permission, {
            through: 'role_permission'
        });
        Role.belongsToMany(models.User, {
            through: 'user_role'
        })
    }

    return Role;
};