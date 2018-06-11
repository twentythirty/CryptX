'use strict';
const ccxt = require('ccxt');

//run once per day at midnight
module.exports.SCHEDULE = '0 0 * * *';
module.exports.NAME = 'EXCH_VOL24';

module.exports.JOB_BODY = async (config, log) => {

    log('1. Fetch all active exchanges...');

    return config.models.Exchange.findAll().then(exchanges => {

        log(`2. Fetch associated exchange mappings for ${exchanges.length} exchanges...`);

        return Promise.all([
            Promise.resolve(exchanges),
            config.models.InstrumentExchangeMapping.findAll({
                where: {
                    exchange_id: _.map(exchanges, 'id')
                }
            })
        ]).then(data => {

            log(`3. Build CCXT connectors and fetch associated symbols info`);

            const [exchanges, mappings] = data;

            const associatedMappings = _.groupBy(mappings, 'exchange_id');
            const exchanges_with_mappings = _.filter(exchanges, exchange => associatedMappings[exchange.id]);

            return Promise.all(_.map(exchanges_with_mappings, exchange => {
                const mappings = associatedMappings[exchange.id];
                log(`Building volume fetcher for ${exchange.name} with ${mappings.length} mappings...`);

                const fetcher = new ccxt[exchange.api_id]();

                //promise pairs made of arrays where [exchange, [mapping, fetched-data]]
                return Promise.all([
                    Promise.resolve(exchange),
                    Promise.all(_.map(mappings, mapping => {
                        log(`Fetching volume for ${exchange.name} on symbol ${mapping.external_instrument_id}...`);

                        //promise pairs made of arrays where [symbol mapping, fetched-data]
                        return Promise.all([
                            Promise.resolve(mapping),
                            fetcher.fetch_ticker(mapping.external_instrument_id)
                        ]);
                    }))
                ])
            })).then(data => {

                log(`4. Saving fetched results...`);

                const records = _.flatMap(data, ([exchange, markets_data]) => {

                    return _.map(markets_data, ([symbol_mapping, market_data]) => {
                        
                        const data_timestamp_to = market_data.timestamp? new Date(market_data.timestamp) : new Date();

                        return {
                            exchange_id: symbol_mapping.exchange_id,
                            instrument_id: symbol_mapping.instrument_id,
                            timestamp_to: data_timestamp_to,
                            timestamp_from: new Date(data_timestamp_to.getTime() - 1000 * 60 * 60 * 24),
                            volume: market_data.baseVolume
                        }
                    });
                });

                return config.models.sequelize.queryInterface.bulkInsert('instrument_liquidity_history', records);
            });
        });
    });
};