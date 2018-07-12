'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        //actual "huobi" exchange no longer alive in ccxt... 
        //huobipro seems to be the replacement
        return queryInterface.bulkInsert('exchange', [
            {
                name: 'Huobi',
                api_id: 'huobipro' 
            }
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('exchange', { 
            where: {
                api_id: 'huobipro'
            }
        });
    }
};