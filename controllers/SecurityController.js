'use strict';

const securityService = require('../services/SecurityService');

const createRole = async function (req, res) {

    const new_role = req.body;
    let [err, role] = await to(securityService.createRole(role));

    return ReS(res, { role: await role.toWeb() });
};

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