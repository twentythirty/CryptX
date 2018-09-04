"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.bulkInsert(
      "role",
      all_roles.map(role => {
        return {
          name: role
        }
      })
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("role", {
      where: {
        id: all_roles
      }
    });
  }
};
