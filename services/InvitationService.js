'use strict';

const User = require("../models").User;
const Role = require("../models").Role;
const UserInvitation = require('../models').UserInvitation;
const Op = require('../models').Sequelize.Op;
const uuidv4 = require('uuid/v4');

const createInvitation = async function (creator, role_id, first_name, last_name, email) {

    //check if user with email already registered
    let user = await User.findOne({
      where: {
        email: email
      }
    });
    if (user) TE(`User with email ${email} already registered in system!`);
  
    //check if role is for real
    const role = await Role.findById(role_id);
    if (!role) TE(`Role with ID ${role_id} not found!`);
  
    const one_week_later = new Date();
    one_week_later.setDate(new Date().getDate() + 7);
    let invitation = new UserInvitation({
      was_used: false,
      token: uuidv4(),
      token_expiry_timestamp: one_week_later,
      creator_id: creator.id,
      first_name: first_name,
      last_name: last_name,
      email: email,
      role_id: role.id
    });
  
    let err;
    [err, invitation] = await to(invitation.save());
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
      }
    });
    if (!invitation) TE(`No unused invitation found for id ${invitation_id} valid before ${new Date()}`);
  
    //all good, flow user creation
    invitation.was_used = true;
    let [err, userData] = await to(invitation.save().then(invitation => {
      //invaldiated invitation, can create user now
      let user = new User({
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        email: invitation.email,
        password: password,
        created_timestamp: new Date(),
        is_active: true
      });
  
      return Promise.all([
        user.save(),
        Role.findById(invitation.role_id)
      ])
    }).then(data => {
      let [user, role] = data;
  
      //return user after roles are set
      return Promise.all([
        user.setRoles([role]),
        Promise.resolve(user)
      ]);
    }));
    if (err) TE(err);
  
    return userData[1];
  };
  module.exports.createUserByInvite = createUserByInvite;