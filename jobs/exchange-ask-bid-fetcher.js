'use strict';
const ccxt = require('ccxt');

//run once every 10 minutes
module.exports.SCHEDULE = '* */10 * * * *';
module.exports.NAME = 'EXCH_ASK_BID';

module.exports.JOB_BODY = async (config) => {

    console.log('1. Fetch all active exchanges...');

    return config.models.Exchange.findAll().then(exchanges => {

        console.log(`2. Fetch associated exchange mappings for ${exchanges.length} exchanges...`);

        return Promise.all([
            Promise.resolve(exchanges),
            config.models.InstrumentExchangeMapping.findAll({
                where: {
                    exchange_id: _.map(exchanges, 'id')
                }
            })
        ]).then(data => {

            console.log(`3. Build CCXT connectors and fetch associated symbols info`);

            const [exchanges, mappings] = data;

            const associatedMappings = _.groupBy(mappings, 'exchange_id');

            return Promise.all(_.map(exchanges, exchange => {
                const mappings = associatedMappings[exchange.id];
                console.log(`Building price fetcher for ${exchange.name} with ${mappings.length} mappings...`);

                const fetcher = new ccxt[exchange.api_id]();

                //promise pairs made of arrays where [exchange, fetched-data]
                return Promise.all([
                    Promise.resolve(exchange),
                    Promise.all(_.map(mappings, mapping => {
                        console.log(`Fetching data for ${exchange.name} on symbol ${mapping.external_instrument_id}...`);

                        //promise pairs made of arrays where [symbol mapping, fetched-data]
                        return Promise.all([
                            Promise.resolve(mapping),
                            fetcher.fetch_order_book(mapping.external_instrument_id)
                        ]);
                    }))
                ])
            })).then(data => {

                console.log(`4. Saving fetched results...`);

                const records = _.flatMap(data, ([exchange, markets_data]) => {

                    return _.map(markets_data, ([symbol_mapping, market_data]) => {

                        return {
                            exchange_id: symbol_mapping.exchange_id,
                            instrument_id: symbol_mapping.instrument_id,
                            timestamp: market_data.timestamp? new Date(market_data.timestamp) : new Date(),
                            ask_price: market_data.asks[0][0],
                            bid_price: market_data.bids[0][0]
                        }
                    });
                });

                return config.models.sequelize.queryInterface.bulkInsert('instrument_market_data', records);
            });
        });
    });
};