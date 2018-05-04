"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    let Role = require("../models").Role;
    let Permission = require('../models').Permission;
    Promise.all([
      Role.findOne({
        where: {
          name: ROLES.ADMIN
        }
      }),
      Role.findOne({
        where: {
          name: ROLES.MANAGER
        }
      }),
      Permission.findAll()
    ]).then(sec_data => {
      const [admin, manager, all_perms] = sec_data;
      return queryInterface.bulkInsert(
        "role_permission",
        //insert all permissions for admin
        all_perms.map(perm => {
          return {
            role_id: admin.id,
            permission_id: perm.id
          };
        })
        .concat(
          //insert change of roles permission to manager
          [{
              role_id: manager.id,
              permission_id: _.find(all_perms, {
                code: PERMISSIONS.ALTER_ROLES
              }).id
            },
            {
              role_id: manager.id,
              permission_id: _.find(all_perms, {
                code: PERMISSIONS.VIEW_USERS
              }).id
            }
          ]
        )
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("role_permission", {
      where: {}
    });
  }
};