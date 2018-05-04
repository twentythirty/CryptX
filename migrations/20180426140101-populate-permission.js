"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "permission",
      _.map(all_permissions, (name, code) => {
        return {
          code: code,
          name: name
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