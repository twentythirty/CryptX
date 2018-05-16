'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.addColumn('instrument',
         'is_deposit', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }).then( data => {
            //add currency to deposit
            return queryInterface.bulkInsert('instrument', [
                {
                    symbol: 'USD',
                    long_name: 'US Dollars',
                    is_base: false,
                    is_deposit: true
                }
            ]);
        });
    },

    down: (queryInterface, Sequelize) => {

        return queryInterface.bulkDelete('instrument', {
            where: {
                symbol: 'USD'
            }
        }).then(done => {

            return queryInterface.removeColumn('instrument', 'is_deposit');
        });
    }
};