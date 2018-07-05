'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.addColumn('execution_order', 'failed_attempts', {
            type: Sequelize.INTEGER,
            allowNull: false
        });

    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('execution_order', 'failed_attempts');
    }
};