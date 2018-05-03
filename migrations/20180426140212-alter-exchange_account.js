"use strict";

const sequelize = require("../models").sequelize;

module.exports = {
  up: (queryInterface, Sequelize) => {
    //cannot be done in a single model column definition
    //due to breaking bug with pg@7.x plugin
    return sequelize.query(
      "CREATE TYPE \"public\".\"enum_exchange_account_account_type\" AS ENUM('Trading', 'Withdrawal')"
    ).then(() => {
      return queryInterface.addColumn("exchange_account", "account_type", {
        type: "enum_exchange_account_account_type",
        allowNull: false
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("exchange_account", "account_type");
  }
};
