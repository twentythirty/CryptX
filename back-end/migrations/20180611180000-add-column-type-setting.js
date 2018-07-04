'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('setting', 'type', {
            type: Sequelize.SMALLINT,
            allowNull: false
          });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('setting', 'type');
    }
};