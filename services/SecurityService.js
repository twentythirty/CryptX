'use strict';

const Role = require("../models").Role;
const Permission = require('../models').Permission;

const changeRolePermissions = async function (role_id, new_perms) {

    let role = await Role.findById(role_id);
    if (!role) TE('Role with id %s not found!', role_id);
  
    let err, neededPerms;
    [err, neededPerms] = await to(Permission.findAll({
      where: {
        code: new_perms
      }
    }));
  
    if (err) TE(err.message);
  
    role.setPermissions(neededPerms);
    [err, role] = await to(role.save())
  
    if (err) TE(err.message);
  
    return role;
  }
  module.exports.changeRolePermissions = changeRolePermissions;