const User = require("../models").User;
const Role = require("../models").Role;
const Permission = require("../models").Permission;
const Sequelize = require('../models').Sequelize;
const Op = Sequelize.Op;
const authService = require("./../services/AuthService");
const inviteService = require('./../services/InvitationService');
const mailUtil = require('./../utils/EmailUtil');

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
    role_id
  } = req.body;

  let [err, invitation] = await to(inviteService.createInvitation(
    req.user,
    role_id,
    first_name,
    last_name,
    email));
  if (err) return ReE(res, err, 422);

  [err, _] = await to(mailUtil.sendMail(
    email,
    `Invitation to CryptX`,
    mailUtil.invitationMailHTML(invitation)
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

  let [err, user] = await to(inviteService.createUserByInvite(invitation_id, password));
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
    user: user.toWeb()
  });
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
  return (user_id === 'me') ? req.user.id : user_id
}

const getUsers = async function (req, res) {

  console.log('WHERE clause: %o', req.seq_where);
  //only search active users
  if (!req.seq_where.is_active) {
    req.seq_where.is_active = true;
  }

  let users = await User.findAll({
    where: req.seq_where
  })
  
  return ReS(res, {
    users: users.map(u => u.toWeb())
  });
};
module.exports.getUsers = getUsers;

const getUser = async function (req, res) {

  let user = await User.findOne({
    where: {
      id: resolveUserId(req),
      is_active: true
    },
    include: [Role]
  });

  if (!user) return ReE(res, "user with id " + req.params.user_id + " not found!", 404);

  return ReS(res, {
    user: user.toWeb()
  });
};
module.exports.getUser = getUser;

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

  if (err) return ReE(res, err, 422);

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
  
  [err, _] = await to(mailUtil.sendMail(
    email,
    `Reset your password in CryptX`,
    mailUtil.passwordResetMailHTML({
      token: user.reset_password_token_hash,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    })
  ));

  if (err) return ReE(res, err, 422);

  return ReS(res, {message: 'Password reset token created'});
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