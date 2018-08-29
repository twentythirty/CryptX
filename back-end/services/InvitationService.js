'use strict';

const User = require("../models").User;
const Role = require("../models").Role;
const UserInvitation = require('../models').UserInvitation;
const Op = require('../models').Sequelize.Op;
const uuidv4 = require('uuid/v4');
const validator = require('validator');

const createUserAndInvitation = async function (creator, role_ids, first_name, last_name, email) {
    
    //check if user with email already registered
    let user = await User.findOne({
        where: {
            email: email
        }
    });
    if (user) TE(`User with email ${email} already registered in system!`);

    //check if role is for real
    const roles = await Role.findAll({
        where: {
            id: role_ids
        }
    });
    if (_.isEmpty(roles)) TE(`No roles with ids ${role_ids} found!`);

    let err, role_associations, invitation;
    [err, user] = await to(User.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        created_timestamp: new Date(),
        is_active: true
    }));

    [err, role_associations] = await to(user.setRoles(roles));
    if (err) TE(err.message);

    const one_week_later = new Date();
    one_week_later.setDate(new Date().getDate() + 7);
    [err, invitation] = await to(UserInvitation.create({
        was_used: false,
        token: uuidv4(),
        token_expiry_timestamp: one_week_later,
        creator_id: creator.id,
        email: email,
        user_id: user.id
    }));
        
    if (err) TE(err.message);

    return [user, invitation];
};
module.exports.createUserAndInvitation = createUserAndInvitation;

const getValidInvitation = async function (token) {

    if (!token) TE(`No token provided!`);

    let [err, invitation] = await to(UserInvitation.findOne({
        where: {
            token: token,
            was_used: false,
            token_expiry_timestamp: {
                [Op.gt]: new Date()
            }
        }
    }));
    if (err) TE(err);
    if (!invitation) TE(`Unused invitation with token ${token} and valid before ${new Date()} not found!`);

    let user_filled_invitation;
    [err, user_filled_invitation] = await to(UserInvitation.findOne({
        where: {
            email: invitation.email,
            was_used: true
        }
    }));
    //user exists with this email - silently invalidate invitation expry and fail loudly
    if (user_filled_invitation) {
        invitation.token_expiry_timestamp = new Date();
        invitation.save();
        TE(`Account is already set up. ${invitation.email} already exists, revoking invitation validity!`);
    }

    return invitation;
};
module.exports.getValidInvitation = getValidInvitation;

const setUpProfile = async function (invitation_id, password) {

    let invitation = await UserInvitation.findOne({
        where: {
            id: invitation_id,
            was_used: false,
            token_expiry_timestamp: {
                [Op.gt]: new Date()
            }
        },
        include: [{
            model: User,
            as: 'user'
        }]
    });
    if (!invitation) TE(`No unused invitation found for id ${invitation_id} valid before ${new Date()}`);
    //check if role exists before comitting to new user creation
    //all good, flow user creation
    invitation.was_used = true;
    let [err, userData] = await to(invitation.save().then(invitation => {
        //invaldiated invitation, can create user now
        invitation.user.active = true;
        invitation.user.password = password;
        return invitation.user.save();
    }));
    if (err) TE(err);

    return userData;
};
module.exports.setUpProfile = setUpProfile;