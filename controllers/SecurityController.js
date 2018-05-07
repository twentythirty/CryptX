'use strict';

const authService = require('../services/AuthService');
const Role = require('../models').Role;

const changeRolePermissions = async function(req, res) {

    const role_id = req.params.role_id;
    let [err, role] = await to(authService.changeRolePermissions(role_id, req.body));

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