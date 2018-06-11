'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('exchange', [
            {
                name: 'Binance',
                api_id: 'binance'
            },
            {
                name: 'Bitfinex',
                api_id: 'bitfinex'
            },
            {
                name: 'Bitstamp',
                api_id: 'bitstamp'
            },
            {
                name: 'Bittrex',
                api_id: 'bittrex'
            },
            {
                name: 'HitBTC',
                api_id: 'hitbtc2'
            },
            {
                name: 'Kraken',
                api_id: 'kraken'
            }
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('exchange', {});
    }
};