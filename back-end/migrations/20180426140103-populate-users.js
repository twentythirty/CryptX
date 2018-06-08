"use strict";

let Role = require("../models").Role;
let User = require("../models").User;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      User.create({
        first_name: "Admin",
        last_name: "",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PWD,
        is_active: true,
        created_timestamp: new Date()
      }),
      Role.findOne({
          where: {
              name: ROLES.ADMIN
          }
      })
    ]).then(data => {
      const [admin, role] = data;
      
      admin.addRole(role);
      return admin.save();
    });
  },
  down: (queryInterface, Sequelize) => {
    return User.destroy({
        where: {
            email: process.env.ADMIN_EMAIL
        }
    })
  }
};
