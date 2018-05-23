'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('exchange', 'api_id', {
            type: Sequelize.STRING,
            allowNull: false
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('exchange', 'api_id');
    }
};