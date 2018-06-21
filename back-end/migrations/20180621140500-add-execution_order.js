'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.addColumn('execution_order', 'price', {
            type: Sequelize.DECIMAL,
            allowNull: false
        });

    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('execution_order', 'price');
    }
};