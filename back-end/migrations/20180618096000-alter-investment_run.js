'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.addColumn('investment_run', 'deposit_usd', {
            type: Sequelize.DECIMAL,
            allowNull: false
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('investment_run', 'deposit_usd');
    }
};