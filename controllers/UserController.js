const User = require("../models").User;
const Sequelize = require('../models').Sequelize;
const Op = Sequelize.Op;
const authService = require("./../services/AuthService");

const create = async function(req, res) {
  const body = req.body;

  let err, user;
  [err, user] = await to(authService.createUser(body));
  if (err) return ReE(res, err, 422);
  return ReS(
    res,
    {
      message: "Successfully created new user.",
      user: user.toWeb(),
      token: user.getJWT()
    },
    201
  );
};
module.exports.create = create;

const login = async function(req, res) {
  let err, user, session;

  [err, userWithSession] = await to(authService.authUser(req.body, req.ip));
  if (err) return ReE(res, err, 422);

  [user, session] = userWithSession;

  return ReS(res, { token: session.token, user: user.toWeb() });
};
module.exports.login = login;

/** 
 * fetch proper DB-friendly numeric user id from request parameters.
 * 
 * 
 * Simply checks if the passed id is the keyword 'me' and extracts session
 * user id in that case 
 * */
function resolveUserId(req) {
  let user_id = req.params.user_id
  return (user_id === 'me')? req.user.id : user_id
}

const getUsers = async function(req, res) {

  console.log('WHERE clause: %o', req.seq_where);

  let users = await User.findAll({
    where: req.seq_where
  })

  return ReS(res, { users: users.map(u => u.toWeb()) });
};
module.exports.getUsers = getUsers;

const getUser = async function(req, res) {

  let user = await User.findById(resolveUserId(req));

  if (!user) return ReE(res, "user with id " + user_id + " not found!", 404);

  return ReS(res, { user: user.toWeb() });
};
module.exports.getUser = getUser;

const editUser = async function(req, res) {
  let user_id = resolveUserId(req);

  let [err, user] = await to(authService.changeUserInfo(user_id, req.body));

  if (err) return ReE(res, err, 422);

  return ReS(res, { user: user.toWeb() });
}
module.exports.editUser = editUser;

const changeUserRole = async function(req, res) {
  const user_id = resolveUserId(req);
  let [err, user] = await to(authService.changeUserRoles(user_id, req.body));

  if (err) return ReE(res, err, 422);

  return ReS(res, { user: user.toWeb() });
};
module.exports.changeUserRole = changeUserRole;

const changePassword = async function (req, res) {
  const old_password = req.body.old_password,
    new_password = req.body.new_password;

  let user_id = resolveUserId(req);

  let [err, user] = await to(authService.updatePassword(user_id, old_password, new_password));
  if (err) return ReE(res, "Old password doesn't match", 403);
  
  let status;
  [err, status] = await to(authService.expireOtherSessions(user_id, req.headers.authorization));
  if (err) return ReE(res, err, 403);

  return ReS(res, { user: user.toWeb() });
}
module.exports.changePassword = changePassword;