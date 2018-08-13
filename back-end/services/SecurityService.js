'use strict';

const User = require('../models').User;
const Role = require("../models").Role;
const Permission = require('../models').Permission;
const { fn: seq_fn, where: seq_where, col: seq_col } = require('../models').sequelize;

const createRole = async function (role_name, permissions) {

	if(
		!_.isString(role_name) || 
		/^\s*$/.test(role_name) ||
		!_.isArray(permissions) || 
		_.isEmpty(permissions)  
	) {
		TE('The name must not be empty and atleast one role must chosen');
	}

	if(role_name == null) TE("Role name can't be empty");

	let err, role_exists, role, new_role = {
		name: role_name
	};

	[ err, role_exists ] = await to(Role.count({
		where: seq_where(seq_fn('lower', seq_col('name')), seq_fn('lower', role_name))
	}));

	if (err) TE(err.message);
	if (role_exists) TE(`Role with the name "${role_name.toUpperCase()}" already exists in system.`);

	[ err, role ] = await to(Role.create(new_role));

	if (err) TE(err.message);

	[ err ] = await to(editRole(role.id, { name: role.name, permissions }));

	if(err) {
		role.destroy();	//Destroy the created role if the permissions were not able tobe set.
		TE(err.messge);
	}

	return role;
};
module.exports.createRole = createRole;

const editRole = async function (role_id, updated_role) {

	if(
		!updated_role || 
		!_.isString(updated_role.name) || 
		/^\s*$/.test(updated_role.name) ||
		!_.isArray(updated_role.permissions) || 
		_.isEmpty(updated_role.permissions)  
	) {
		TE('The name must not be empty and atleast one role must chosen');
	}

	let err, role = await Role.findById(role_id, {
		include: [Permission]
	});
	if (!role) TE('Role with id %s not found!', role_id);

	// update name if set
	role.name = updated_role.name != null ? updated_role.name.trim() : role.name;

	[err, role] = await to(role.save());
	if (err) TE(err.message);

	if(updated_role.permissions != null) {
		let neededPerms;
		[err, neededPerms] = await to(Permission.findAll({
			where: {
				code: updated_role.permissions
			}
		}));

		if (err) TE(err.message);

		// check if all permissions were found
		let missingPerms = _.difference(
			updated_role.permissions, neededPerms.map(perm => perm.code)
		);
		if (missingPerms.length) console.error("Couldn't find permissions: %s", missingPerms);
		
		let assoc;
		[err, assoc] = await to(role.setPermissions(neededPerms)); // waits until role and permission associations are written into DB.
		
		if (err) TE(err.message);
	}

	return role;
}
module.exports.editRole = editRole;

const deleteRole = async function (role_id) {

	let err, role = await Role.findById(role_id, {
			include: [ User ]
	});
	if (!role) TE("role with id %s not found", role_id);

	if(role.Users.length) TE("Cannot delete role that's currently assigned to users"); 

	[err, role] = await to(role.destroy());
	if (err) TE(err.message);

	return true;
}
module.exports.deleteRole = deleteRole;