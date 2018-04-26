"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "permission",
      Object.keys(all_permissions).map(key => {
          return {
              id: key,
              name: all_permissions[key]
          }
      })
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("permission", {
      where: {
        id: Object.keys(all_permissions)
      }
    });
  }
};
