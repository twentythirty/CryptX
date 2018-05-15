'use strict';

const securityService = require('../services/SecurityService');
const Role = require('../models').Role;
const Permission = require('../models').Permission;
const sequelize = require('sequelize');

const createRole = async function (req, res) {
    const role_name = req.body.name,
        role_permissions = req.body.permissions;

    let [err, role] = await to(securityService.createRole(role_name));
    if (err) return ReE(res, err, 422);

    [err, role] = await to(securityService.changeRolePermissions(role.id, role_permissions));
    if (err) return ReE(res, err, 422);

    return ReS(res, { role: await role.toWeb() });
};
module.exports.createRole = createRole;


const changeRolePermissions = async function(req, res) {

    const role_id = req.params.role_id;
    let [err, role] = await to(securityService.changeRolePermissions(role_id, req.body));

    if (err) return ReE(res, err, 422);

    return ReS(res, { role: await role.toWeb() });
};

module.exports.changeRolePermissions = changeRolePermissions;


const getRoleInfo = async function(req, res) {

    const role_id = req.params.role_id;
    let [err, role] = await to(Role.findById(role_id))

    if (err) return ReE(res, err, 422);

    return ReS(res, { role: await role.toWeb() });
};

module.exports.getRoleInfo = getRoleInfo;

const deleteRole = async function (req, res) {

    const role_id = req.params.role_id;
    let [err, result] = await to(securityService.deleteRole(role_id));

    if (err) return ReE(res, err, 422);

    return ReS(res, { message: "Role successfully deleted" });
}

module.exports.deleteRole = deleteRole;