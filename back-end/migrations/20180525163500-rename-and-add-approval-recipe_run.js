'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.renameColumn('recipe_run', 'status', 'approval_status')
    .then(() => {

      return queryInterface.renameColumn('recipe_run', 'comment', 'approval_comment');
    }).then(() => {

      return queryInterface.addColumn('recipe_run', 'approval_timestamp', {
        type: Sequelize.DATE,
        allowNull: true
      });

    }).then(() => {

      return queryInterface.addColumn('recipe_run', 'approval_user_id', {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade",
        allowNull: true
      });

    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipe_run', 'approval_timestamp')
    .then(() => {

      return queryInterface.renameColumn('recipe_run', 'approval_comment', 'comment');
    }).then(() => {

      return queryInterface.renameColumn('recipe_run', 'approval_status', 'status');
    }).then(() => {

      return queryInterface.removeColumn('recipe_run', 'approval_user_id');
    });
  }
};