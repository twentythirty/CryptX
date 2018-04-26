"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    let Role = require("../models").Role;
    Promise.all([
      Role.findOne({ where: { name: ROLES.ADMIN } }),
      Role.findOne({ where: { name: ROLES.MANAGER } })
    ]).then(roles => {
      const [admin, manager] = roles;
      return queryInterface.bulkInsert(
        "role_permission",
        //insert all permissions for admin
        Object.keys(all_permissions)
          .map(perm => {
            return {
              role_id: admin.id,
              permission_id: perm
            };
          })
          .concat(
            //insert change of roles permission to manager
            [
              {
                role_id: manager.id,
                permission_id: PERMISSIONS.ALTER_ROLES
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
