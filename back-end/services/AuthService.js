'use strict';

const User = require("../models").User;
const Role = require("../models").Role;
const Permission = require('../models').Permission;
const UserSession = require("../models").UserSession;
const validator = require("validator");
const Op = require('../models').Sequelize.Op;
const uuidv4 = require('uuid/v4');

const createUser = async function (userInfo) {
  let email = userInfo.email;

  if ([
      userInfo.email,
      userInfo.first_name,
      userInfo.last_name,
      userInfo.password
    ].some(prop => prop == null)) {
    TE("Some of the required properties were null!");
  }

  const defaults = {
    created_timestamp: new Date(),
    is_active: true
  };

  if (validator.isEmail(email)) {

    let [err, user] = await to(User.create(Object.assign(defaults, userInfo)));
    if (err) TE(err.message)

    return user;
  } else {
    TE("A valid email was not entered.");
  }
};
module.exports.createUser = createUser;

const authUser = async function (credentials, clientIP) {
  //returns token
  if (!credentials.username) TE("Please enter a username to login");
  if (!credentials.password) TE("Please enter a password to login");

  let err, user, session;

  [err, user] = await to(
    User.findOne({
      where: {
        email: credentials.username
      },
      include: [{
        model: Role,
        include: [Permission]
      }]
    })
  );
  if (err) TE(err.message);

  if (!user) TE("Not registered");
  if (!user.is_active) TE("User deactivated");

  [err, user] = await to(user.comparePassword(credentials.password));
  if (err) TE(err.message);

  //user valid, lets make a session
  [err, session] = await to(
    UserSession.create({
      user_id: user.id,
      token: user.getJWT(),
      expiry_timestamp: new Date(
        new Date().getTime() + 1000 * process.env.JWT_EXPIRATION
      ),
      ip_address: clientIP
    })
  );
  if (err) TE(err.message)
  
  let perms = _.flatMap(user.Roles.map(role => {
    
    return role.Permissions.map(permission => {
      return permission.code;
    });
  }));

  return [user, perms, session];
};
module.exports.authUser = authUser;

const changeUserRoles = async function (user_id, new_roles) {

  let user = await User.findById(user_id);
  if (!user) TE("User with id %s not found!", user_id)

  let err, neededRoles;
  [err, neededRoles] = await to(Role.findAll({
    where: {
      id: new_roles
    }
  }));

  if (err) TE(err.message);

  user.setRoles(neededRoles);
  [err, user] = await to(user.save())

  if (err) TE(err.message);

  return user;
}
module.exports.changeUserRoles = changeUserRoles;

const changeUserInfo = async function (user_id, new_info) {

  let err, user = await User.findById(user_id);
  if (!user) TE("User with id %s not found!", user_id)

  //create object from allowed for editing prop names
  user = Object.assign(user, _.fromPairs(_.zipWith([
    'first_name',
    'last_name',
    'is_active',
    'email'
  ], (prop_name) => {
    return [
      prop_name,
      (new_info[prop_name] != null ?
        new_info[prop_name] :
        user[prop_name])
    ]; //return pairs [[first_name, value],[last_name,value]...]
  })));

  [err, user] = await to(user.save());
  if (err) TE(err.message);

  let roles = new_info.roles;
  if (roles) {
    [err, user] = await to(this.changeUserRoles(user_id, roles));
    if (err) return ReE(res, err.message, 422);
  } 

  return user;
}
module.exports.changeUserInfo = changeUserInfo;

const updatePassword = async function (user_id, old_password, new_password) {

  if (!old_password || !new_password)
    TE("Please supply old and new passwords to change your password");

  let err, user = await User.findById(user_id);
  if (!user) TE("User with id %s not found!", user_id);

  [err, user] = await to(user.comparePassword(old_password));
  if (err) TE(err.message);

  user.password = new_password;
  [err, user] = await to(user.save());

  if (err) TE(err.message);

  return user;
}
module.exports.updatePassword = updatePassword;

const expireOtherSessions = async function (user_id, keep_active_session) {

  let err, user_sessions, expiration_timestamp, Sequelize = require('sequelize');
  [err, user_sessions] = await to(UserSession.findAll({
    where: {
      user_id: user_id,
      expiry_timestamp: {
        [Sequelize.Op.gt]: new Date() // greather than now
      },
      token: {
        [Sequelize.Op.ne]: keep_active_session
      }
    }
  }));
  if (err) TE(err.message);

  expiration_timestamp = new Date() - 1;
  await Promise.all(user_sessions.map(session => {
    session.expiry_timestamp = expiration_timestamp;
    return session.save();
  })).catch(error => {
    TE(error);
  });

  return true;
}
module.exports.expireOtherSessions = expireOtherSessions;

const deleteUser = async function(user_id) {

  let [err, user] = await to(User.findOne({
    where: {
      id: user_id
    }
  }));
  if (err) TE(err);
  if (!user) TE(`User with id ${user_id} not found!`);
  //if user already "deleted" - this is a NOOP
  if (user.is_active) {
    //"delete" user
    user.is_active = false;
    user = await user.save();
  }

  return user;
}
module.exports.deleteUser = deleteUser;

const sendPasswordResetToken = async function (email) {

  let [err, user] = await to(User.findOne({
    where:{
      email: email
    }
  }));

  //if there is no user found for this email or the user is inactive,
  //we need to fail silently for security reasons
  if(!user || !user.is_active) return null;

  user.reset_password_token_hash = uuidv4();
  user.reset_password_token_expiry_timestamp = new Date(
    new Date().getTime() + (24 * 60 * 60 * 1000)
  );
  
  [err, user] = await to(user.save());
  if(err) TE(err.message);

  return user;
};
module.exports.sendPasswordResetToken = sendPasswordResetToken;

const verifyResetTokenValidity = async function (token) {

  let err, user = await User.findOne({
    where: {
      reset_password_token_hash: token
    }
  });

  if(!user) TE("Password reset token not found");

  if(user.reset_password_token_expiry_timestamp < new Date()) {
    user.reset_password_token_expiry_timestamp = null;
    user.reset_password_token_hash = null;
    
    [err, user] = await to(user.save());
    if (err) TE(err.message);

    TE("Password reset token expired");
  }

  return user;
}
module.exports.verifyResetTokenValidity = verifyResetTokenValidity;

const resetPassword = async function (user_id, new_password) {

  if (new_password == null || !new_password.length) TE("Please enter password");

  let [err, user] = await to(User.findById(user_id));
  
  if (err) TE(err.message);

  Object.assign(user, {
    password: new_password,
    reset_password_token_hash: null,
    reset_password_token_expiry_timestamp: null,
  });

  [err, user] = await to(user.save());
  
  if (err) TE(err.message);

  return user;
}
module.exports.resetPassword = resetPassword;