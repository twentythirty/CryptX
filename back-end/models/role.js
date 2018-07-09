"use strict";

module.exports = (sequelize, DataTypes) => {

    var Role = sequelize.define(
        'Role', {
            name: DataTypes.STRING
        },
        modelProps(
            'role',
            'Table that contains all the roles available in the system'
        )
    );

    Role.associate = function (models) {
        Role.belongsToMany(models.Permission, {
            through: 'role_permission',
            timestamps: false
        });
        Role.belongsToMany(models.User, {
            through: 'user_role',
            timestamps: false
        })
        Role.belongsToMany(models.UserInvitation, {
            through: 'user_invitation_role',
            timestamps: false
        })
    }

    Role.prototype.toWeb = async function () {
        return {
            id: this.id,
            name: this.name,
            permissions: await (this.getPermissions()).map(p => p.code)
        }
    }

    return Role;
};