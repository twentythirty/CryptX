'use strict';

const authService = require('../services/AuthService');

const changeRolePermissions = async function(req, res) {

    const role_id = req.params.role_id;
    let [err, role] = await to(authService.changeRolePermissions(role_id, req.body));

    if (err) return ReE(res, err, 422);

    return ReS(res, { role: role });
};

module.exports.changeRolePermissions = changeRolePermissions;