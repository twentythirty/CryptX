'use strict';

const User = require("../models").User;
const Role = require("../models").Role;
const UserInvitation = require('../models').UserInvitation;
const Op = require('../models').Sequelize.Op;
const uuidv4 = require('uuid/v4');
const validator = require('validator');

const createInvitation = async function (creator, role_ids, first_name, last_name, email) {

    //check if user with email already registered
    let user = await User.findOne({
        where: {
            email: email
        }
    });
    if (user) TE(`User with email ${email} already registered in system!`);

    //check if role is for real
    const role = await Role.findAll({
        where: {
            id: role_ids
        }
    });
    if (!role) TE(`Role with ID ${role_ids} not found!`);


    const one_week_later = new Date();
    one_week_later.setDate(new Date().getDate() + 7);
    let [err, invitation] = await to(UserInvitation.create({
        was_used: false,
        token: uuidv4(),
        token_expiry_timestamp: one_week_later,
        creator_id: creator.id,
        first_name: first_name,
        last_name: last_name,
        email: email,
    }));
        
    if (err) TE(err.message);

    let role_associations;
    [err, role_associations] = await to(invitation.setRoles(role_ids));
    if (err) TE(err.message);

    return invitation;
};
module.exports.createInvitation = createInvitation;

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

    let user = await User.findOne({
        where: {
            email: invitation.email
        }
    });
    //user exists with this email - silently invalidate invitation expry and fail loudly
    if (user) {
        invitation.token_expiry_timestamp = new Date();
        invitation.save();
        TE(`User with email ${invitation.email} already exists, revoking invitation validity!`);
    }

    return invitation;
};
module.exports.getValidInvitation = getValidInvitation;

const createUserByInvite = async function (invitation_id, password) {

    let invitation = await UserInvitation.findOne({
        where: {
            id: invitation_id,
            was_used: false,
            token_expiry_timestamp: {
                [Op.gt]: new Date()
            }
        },
        include: [{
            model: Role
        }]
    });
    if (!invitation) TE(`No unused invitation found for id ${invitation_id} valid before ${new Date()}`);
    //check if role exists before comitting to new user creation
    //all good, flow user creation
    invitation.was_used = true;
    let [err, userData] = await to(invitation.save().then(invitation => {
        //invaldiated invitation, can create user now
        return User.create({
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            email: invitation.email,
            password: password,
            created_timestamp: new Date(),
            is_active: true
        })
    }).then(user => {
        //return user after roles are set
        return Promise.all([
            user.setRoles(invitation.Roles),
            Promise.resolve(user)
        ]);
    }));
    if (err) TE(err);

    return userData[1];
};
module.exports.createUserByInvite = createUserByInvite;