'use strict';

module.exports = (sequelize, DataTypes) => {

    var UserInvitation = sequelize.define(
        "UserInvitation", {
            was_used: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            token: DataTypes.STRING,
            token_expiry_timestamp: DataTypes.DATE,
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: false,
                validate: {
                    isEmail: {
                        msg: "Email invalid."
                    }
                }
            }
        },
        modelProps(
            'user_invitation',
            'This table stores invite tokens generated to get users to sign up'
        )
    );

    UserInvitation.associate = function (models) {
        UserInvitation.belongsTo(models.User, {
            as: 'creator',
            foreignKey: 'creator_id'
        });
        UserInvitation.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'user_id'
        });
    };

    UserInvitation.prototype.toWeb = function() {

        let json = this.toJSON();
        json.token_expiry_timestamp = json.token_expiry_timestamp.getTime();
        return json;
    };

    return UserInvitation;
};