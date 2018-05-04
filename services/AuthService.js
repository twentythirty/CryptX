'use strict';

const User = require("../models").User;
const Role = require("../models").Role;
const UserSession = require("../models").UserSession;
const validator = require("validator");

const createUser = async function(userInfo) {
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

const authUser = async function(credentials, clientIP) {
  //returns token
  if (!credentials.username) TE("Please enter a username to login");
  if (!credentials.password) TE("Please enter a password to login");

  let err, user, session;

  [err, user] = await to(
    User.findOne({ where: { email: credentials.username } })
  );
  if (err) TE(err.message);

  if (!user) TE("Not registered");

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

  return [user, session];
};
module.exports.authUser = authUser;

const changeUserRoles = async function(user_id, new_roles) {

    let user = await User.findById(user_id);
    if (!user) TE("User with id " + user_id + " not found!")

    let err, neededRoles;
    [err, neededRoles] = await to(Role.findAll({
        where: {
            name: new_roles
        }
    }));

    if (err) TE(err.message);

    user.setRoles(neededRoles);
    [err, user] = await to(user.save())

    if (err) TE(err.message);

    return user;
}
module.exports.changeUserRoles = changeUserRoles;
