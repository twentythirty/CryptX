'use strict';

const securityService = require('../services/SecurityService');
const Role = require('../models').Role;
const Permission = require('../models').Permission;
const PermissionsCategory = require('../models').PermissionsCategory;
const sequelize = require('sequelize');
const Op = sequelize.Op;
const adminViewService = require('../services/AdminViewsService');

const createRole = async function (req, res) {
    const role_name = req.body.name,
        role_permissions = req.body.permissions;

    let [err, role] = await to(securityService.createRole(role_name));
    if (err) return ReE(res, err, 422);

    [err, role] = await to(securityService.editRole(role.id, {
        permissions: role_permissions
    }));
    if (err) return ReE(res, err, 422);

    return ReS(res, { role: await role.toWeb() });
};
module.exports.createRole = createRole;


const editRole = async function(req, res) {

    const role_id = req.params.role_id;
    let [err, role] = await to(securityService.editRole(role_id, req.body));

    if (err) return ReE(res, err, 422);

    return ReS(res, { role: await role.toWeb() });
};

module.exports.editRole = editRole;


const getRoleInfo = async function(req, res) {

    const role_id = req.params.role_id;
    let [err, role] = await to(Role.findById(role_id))

    if (err) return ReE(res, err, 422);

    return ReS(res, { role: await role.toWeb() });
};

module.exports.getRoleInfo = getRoleInfo;


const getRoles = async function(req, res) {
    let hasPermissions = req.body.has_permissions;
    
    console.log('WHERE clause: %o', req.seq_where);

    let query = req.seq_query;

    if (hasPermissions != null)
        query.include =  {
            model: Permission,
            where: {
                code: { [Op.in]: hasPermissions }
            }
        };

    let [err, result] = await to(Role.findAndCountAll(query));
    if (err) return ReE(res, err.message, 422);
    
    let { rows: roles, count } = result;

    let footer = await adminViewService.fetchRoleFooter(req.seq_where);

    return ReS(res, {
      roles: await Promise.all(roles.map(u => u.toWeb())),
      count,
      footer
    });
};

module.exports.getRoles = getRoles;

const getAllPermissions = async function(req, res) {
    //categories with permissions info preloaded
    const permissions_categories = await PermissionsCategory.findAll({
        include: [Permission],
        order: [
            ['order_idx', 'ASC']
        ]
    });

    return ReS(res, {
        total: permissions_categories.length,
        data: _.map(permissions_categories, permission_cat => {
            
            return {
                id: permission_cat.id,
                name: permission_cat.name,
                permissions: _.map(permission_cat.Permissions, perm => {
                    return {
                        id: perm.id,
                        code: perm.code,
                        name: perm.name
                    };
                })
            };
        })
    });
}
module.exports.getAllPermissions = getAllPermissions;


const deleteRole = async function (req, res) {

    const role_id = req.params.role_id;
    let [err, result] = await to(securityService.deleteRole(role_id));

    if (err) return ReE(res, err, 422);

    return ReS(res, { message: "Role successfully deleted" });
}

module.exports.deleteRole = deleteRole;