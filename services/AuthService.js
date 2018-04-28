const User = require("../models").User;
const UserSession = require("../models").UserSession;
const validator = require("validator");

const getUniqueKeyFromBody = function(body) {
  // this is so they can send in 3 options unique_key, email, or phone and it will work
  let unique_key = body.unique_key;
  if (typeof unique_key === "undefined") {
    if (typeof body.email != "undefined") {
      unique_key = body.email;
    } else if (typeof body.phone != "undefined") {
      unique_key = body.phone;
    } else {
      unique_key = null;
    }
  }

  return unique_key;
};
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createUser = async function(userInfo) {
  let unique_key, auth_info, err;

  auth_info = {};
  auth_info.status = "create";

  unique_key = getUniqueKeyFromBody(userInfo);
  if (!unique_key) TE("An email or phone number was not entered.");

  if (validator.isEmail(unique_key)) {
    auth_info.method = "email";
    userInfo.email = unique_key;

    [err, user] = await to(User.create(userInfo));
    if (err) TE("user already exists with that email");

    return user;
  } else if (validator.isMobilePhone(unique_key, "any")) {
    //checks if only phone number was sent
    auth_info.method = "phone";
    userInfo.phone = unique_key;

    [err, user] = await to(User.create(userInfo));
    if (err) TE("user already exists with that phone number");

    return user;
  } else {
    TE("A valid email or phone number was not entered.");
  }
};
module.exports.createUser = createUser;

const authUser = async function(credentials, clientIP) {
  //returns token

  if (!credentials.username) TE("Please enter a username to login");
  if (!credentials.password) TE("Please enter a password to login");

  let user, session;

  [err, user] = await to(User.findOne({ where: { email: credentials.username } }));
  if (err) TE(err.message);

  if (!user) TE("Not registered");

  [err, user] = await to(user.comparePassword(credentials.password));
  if (err) TE(err.message);

  //user valid, lets make a session
  [err, session] = await to (UserSession.create({
    user_id: user.id,
    token: user.getJWT(),
    expiry_timestamp: new Date(new Date().getTime() + 1000 * process.env.JWT_EXPIRATION),
    ip_address: clientIP
  }));

  return [user, session];
};
module.exports.authUser = authUser;
