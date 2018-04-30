const User = require("../models").User;
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

const getMe = async function(req, res) {
  let user = req.user;

  return ReS(res, { user: user.toWeb() });
};
module.exports.getMe = getMe;

const getUser = async function(req, res) {
  let user_id = req.params.user_id;
  let [err, user] = User.findById(user_id);

  if (err) ReE(res, "user with id " + user_id + " not found!", 404);

  return ReS(res, { user: user.toWeb() });
};
module.exports.getUser = getUser;

const changeUserRole = async function(req, res) {
  const user_id = req.params.user_id;
  let [err, user] = await to(authService.changeUserRoles(user_id, req.body));

  if (err) return ReE(res, err, 422);

  return ReS(res, { user: user.toWeb() });
};
module.exports.changeUserRole = changeUserRole;
