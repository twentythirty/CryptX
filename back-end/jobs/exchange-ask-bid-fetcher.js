'use strict';
const ccxt = require('ccxt');
const { logAction } = require('../utils/ActionLogUtil');

const action_path = 'ask_bid_fetcher';

const actions = {
    failed_to_fetch: `${action_path}.failed_to_fetch`,
};


//run once every 5 minutes
module.exports.SCHEDULE = '*/10 * * * * *';
module.exports.NAME = 'EXCH_ASK_BID';

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
                log(`Building price fetcher for ${exchange.name} with ${mappings.length} mappings...`);

                const fetcher = new ccxt[exchange.api_id]();

                //promise pairs made of arrays where [exchange, [mapping, fetched-data]]
                return Promise.all([
                    Promise.resolve(exchange),
                    Promise.all(_.map(mappings, mapping => {
                        log(`Fetching data for ${exchange.name} on symbol ${mapping.external_instrument_id}...`);

                        //promise pairs made of arrays where [symbol mapping, fetched-data]
                        return Promise.all([
                            Promise.resolve(mapping),
                            //wrap exchange promise into a promise that returns empty array if broken
                            Promise.resolve(fetcher.fetch_order_book(mapping.external_instrument_id)).catch(err => {
                                return []
                            })
                        ]);
                    }))
                ])
            })).then(data => {

                log(`4. Saving fetched results...`);

                const records = _.flatMap(data, ([exchange, markets_data]) => {

                    /* Sometimes for some reason market_data is empty and set to array.
                    Filtering out results that don't have needed properties
                    to avoid errors when assigning asks and bids values. */
                    let [successfully_fetched, failed_to_fetch] = _.partition(markets_data, ([symbol_mapping, market_data]) =>
                        !_.isArray(market_data) &&
                        market_data.hasOwnProperty('asks') &&
                        market_data.hasOwnProperty('bids')
                    );

                    failed_to_fetch = failed_to_fetch.map(([symbol_mapping, failed_data]) => {
                        return symbol_mapping.external_instrument_id
                    });

                    if(failed_to_fetch.length) {
                        logAction(actions.failed_to_fetch, {
                            args: {
                                instruments: failed_to_fetch,
                                exchange: exchange.name,
                            },
                            relations: { exchange_id: exchange.id }
                        });
                    }

                    return _.map(successfully_fetched, ([symbol_mapping, market_data]) => {

                        return {
                            exchange_id: symbol_mapping.exchange_id,
                            instrument_id: symbol_mapping.instrument_id,
                            timestamp: market_data.timestamp? new Date(market_data.timestamp) : new Date(),
                            ask_price: market_data.asks[0][0],
                            bid_price: market_data.bids[0][0]
                        }
                    });
                });
                if (records.length > 0)
                    return config.models.sequelize.queryInterface.bulkInsert('instrument_market_data', records);
                else
                    return "No records inserted!";
            });
        });
    });
};