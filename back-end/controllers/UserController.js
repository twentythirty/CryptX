const User = require("../models").User;
const Role = require("../models").Role;
const Permission = require("../models").Permission;
const Sequelize = require('../models').Sequelize;
const Op = Sequelize.Op;
const authService = require("./../services/AuthService");
const adminViewsService = require('../services/AdminViewsService');
const inviteService = require('./../services/InvitationService');
const mailUtil = require('./../utils/EmailUtil');
const model_constants = require('../config/model_constants');
require('../config/validators');

const create = async function (req, res) {
  const body = req.body;

  let err, user;
  [err, user] = await to(authService.createUser(body));
  if (err) return ReE(res, err, 422);
  return ReS(
    res, {
      message: "Successfully created new user.",
      user: user.toWeb(),
      token: user.getJWT()
    },
    201
  );
};
module.exports.create = create;

const issueInvitation = async function (req, res) {

  const {
    first_name,
    last_name,
    email,
    role_id// array or role ids 
  } = req.body;
  
  let [err, user_and_invite] = await to(inviteService.createUserAndInvitation(
    req.user,
    role_id,
    first_name,
    last_name,
    email));
  if (err) return ReE(res, err, 422);

  const [user, invitation] = user_and_invite;

  let email_result;
  [err, email_result] = await to(mailUtil.sendMail(
    email,
    `You have been invited to join CryptX!`,
    mailUtil.invitationMailHTML({
      full_name: user.full_name(),
      token: invitation.token
    })
  ));

  if (err) {
    return ReE(res, err, 422);
  }

  return ReS(res, {
    message: `Sent invite to ${email} OK.`
  });
};
module.exports.issueInvitation = issueInvitation;

const inviteTokenInfo = async function (req, res) {
  const token = req.body.token;

  if (!token) {
    return ReE(res, `No token found in request params!`, 422);
  }

  let [err, invitation] = await to(inviteService.getValidInvitation(token));
  if (err) {
    return ReE(res, err, 422);
  }

  return ReS(res, {
    invitation: invitation.toWeb()
  });
};
module.exports.inviteTokenInfo = inviteTokenInfo;

const createByInvite = async function (req, res) {

  const {
    invitation_id,
    password
  } = req.body;

  let [err, user] = await to(inviteService.setUpProfile(invitation_id, password));
  if (err) {
    return ReE(res, err, 422);
  }

  return ReS(res, {
    user: user.toWeb()
  });
};
module.exports.createByInvite = createByInvite;

const login = async function (req, res) {
  let err, user, session;

  [err, userWithSession] = await to(authService.authUser(req.body, req.ip));
  if (err) return ReE(res, err, 422);

  [user, perms, session] = userWithSession;

  return ReS(res, {
    token: session.token,
    permissions: perms,
    model_constants: model_constants,
    validators: VALIDATORS,
    user: user.toWeb(false)
  });
};
module.exports.login = login;

const logout = async function (req, res) {

  let [err, sessions] = await to(authService.terminateUserSessions(req.user.id));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    message: "OK!"
  });
};
module.exports.logout = logout;
/** 
 * fetch proper DB-friendly numeric user id from request parameters.
 * 
 * 
 * Simply checks if the passed id is the keyword 'me' and extracts session
 * user id in that case 
 * */
function resolveUserId(req) {
  let user_id = req.params.user_id
  return (user_id === 'me') ? req.user.id : user_id
}

const getUsers = async function (req, res) {

  console.log('WHERE clause: %o', req.seq_where);
  console.log(`SQL WHERE clause: ${req.sql_where}`);
  let [err, result] = await to(adminViewsService.fetchUsersViewDataWithCount(req.seq_query));
  if (err) return ReE(res, err.message, 422);
  let footer = [];
  [err, footer] = await to(adminViewsService.fetchUsersViewFooter(req.sql_where));
  if(err) return ReE(res, err.message, 422);

  let { data: users, total: count } = result;
  
  return ReS(res, {
    users,
    count,
    footer
  });
};
module.exports.getUsers = getUsers;

const getUser = async function (req, res) {

  let user = await User.findOne({
    where: {
      id: resolveUserId(req),
      //is_active: true
    },
    include: [Role]
  });

  if (!user) return ReE(res, "user with id " + req.params.user_id + " not found!", 404);

  return ReS(res, {
    user: user.toWeb()
  });
};
module.exports.getUser = getUser;

const getUsersColumnLOV = async (req, res) => {

  const field_name = req.params.field_name
  const { query } = _.isPlainObject(req.body)? req.body : { query: '' };

  const field_vals = await adminViewsService.fetchUsersViewHeaderLOV(field_name, query);

  return ReS(res, {
    query: query,
    lov: field_vals
  })
};
module.exports.getUsersColumnLOV = getUsersColumnLOV;

const getUserPermissions = async function (req, res) {

  let user_id = req.user.id;

  let user = await User.findOne({
    where: {
      id: user_id
    },
    include: [{
      model: Role,
      include: Permission
    }]
  });

  if (!user) return ReE(res, "user with id " + req.params.user_id + " not found!", 404);

  let perms = _.flatMap(user.Roles.map(role => {
    
    return role.Permissions.map(permission => {
      return permission.code;
    });
  }));

  return ReS(res, {
    permissions: perms
  });
};
module.exports.getUserPermissions = getUserPermissions;

const editUser = async function (req, res) {
  let user_id = resolveUserId(req);

  let [err, user] = await to(authService.changeUserInfo(user_id, req.body));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    user: user.toWeb()
  });
}
module.exports.editUser = editUser;

const changeUserRole = async function (req, res) {
  const user_id = resolveUserId(req);
  let [err, user] = await to(authService.changeUserRoles(user_id, req.body));

  if (err) return ReE(res, err, 422);

  return ReS(res, {
    user: user.toWeb()
  });
};
module.exports.changeUserRole = changeUserRole;

const changePassword = async function (req, res) {
  const old_password = req.body.old_password,
    new_password = req.body.new_password;

  if (!isNaN(req.params.user_id)) return ReE(res, 'You can only change your own password', 403);

  let user_id = resolveUserId(req);

  let [err, user] = await to(authService.updatePassword(user_id, old_password, new_password));
  if (err) return ReE(res, "Old password doesn't match", 403);

  let status; 
  [err, status] = await to(authService.expireOtherSessions(user_id, req.headers.authorization));
  if (err) return ReE(res, err, 403);

  return ReS(res, {
    user: user.toWeb()
  });
}
module.exports.changePassword = changePassword;


const deleteUser = async function(req, res) {
  let user_id = resolveUserId(req);

  let [err, user] = await to(authService.deleteUser(user_id));
  if (err) return ReE(res, err, 422);

  return ReS(res, {
    user: user.toWeb()
  });
}
module.exports.deleteUser = deleteUser;

const sendPasswordResetToken = async function (req, res) {
  
  let email = req.body.email;
  let [err, user] = await to(authService.sendPasswordResetToken(email));
  if (err) return ReE(res, err, 404);

  //service could have failed silently
  //return an OK response, but an empty one
  if (user == null) {
    return ReS(res, { message: `Password reset token created if ${email} is a valid user` })
  }
  
  let email_result;
  [err, email_result] = await to(mailUtil.sendMail(
    email,
    `Reset your CryptX password`,
    mailUtil.passwordResetMailHTML({
      token: user.reset_password_token_hash,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    })
  ));

  if (err) return ReE(res, err, 422);

  return ReS(res, { message: `Password reset token created if ${email} is a valid user` })
}
module.exports.sendPasswordResetToken = sendPasswordResetToken;

const checkPasswordResetToken = async function (req, res) {
  
  let token = req.params.token;
  let [err, user] = await to(authService.verifyResetTokenValidity(token));
  
  if(err) return ReE(res, "Token not valid or expired", 404);

  return ReS(res, {message: 'valid'});
};
module.exports.checkPasswordResetToken = checkPasswordResetToken;

const resetPassword = async function (req, res) {

  let token = req.params.token,
    password = req.body.new_password;

  let [err, user] = await to(authService.verifyResetTokenValidity(token));
  if (err) return ReE(res, "Token not valid or expired", 404);

  [err, user] = await to(authService.resetPassword(user.id, password));
  if (err) return ReE(res, err, 422);

  return ReS(res, {message: 'Password successfully changed'});
};
module.exports.resetPassword = resetPassword;

/* Is used to get data needed in front-end if user is logged in. */
const checkAuth = async function (req, res) {

  let user_id = req.user.id;
  let user = await User.findOne({
    where: {
      id: user_id,
      is_active: true
    },
    include: {
      model: Role,
      include: Permission
    }
  });

  if (!user) return ReE(res, "user with id " + req.params.user_id + " not found!", 404);

  let perms = _.flatMap(user.Roles.map(role => {
    
    return role.Permissions.map(permission => {
      return permission.code;
    });
  }));

  return ReS(res, {
    user: user.toWeb(),
    model_constants,
    permissions: perms
  });
};
module.exports.checkAuth = checkAuth;
