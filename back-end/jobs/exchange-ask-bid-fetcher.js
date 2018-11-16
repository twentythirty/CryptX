'use strict';
const ccxtUtils = require('../utils/CCXTUtils')
const { logAction } = require('../utils/ActionLogUtil');

const action_path = 'ask_bid_fetcher';

const actions = {
    instrument_error: `${action_path}.instrument_error`,
    instrument_without_data: `${action_path}.instrument_without_data`,
    job_error: `${action_path}.job_error`,
    failed_to_fetch: `${action_path}.failed_to_fetch`,
};


//run once every 5 minutes
module.exports.SCHEDULE = '*/5 * * * *';
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
        ]);
    }).then(data => {

        log(`3. Get CCXT connectors and fetch associated symbols info`);
        let [exchanges, mappings] = data;

        const associatedMappings = _.groupBy(mappings, 'exchange_id');
        const exchanges_with_mappings = _.filter(exchanges, exchange => associatedMappings[exchange.id]);

        return Promise.all(
            _.map(exchanges_with_mappings, async (exchange) => {

                let failed_instruments, fetched_market_data;

                try {
                    
                    let [err, con_result] = await to(Promise.all([
                        ccxtUtils.getConnector(exchange.id),
                        ccxtUtils.getThrottle(exchange.api_id)
                    ]));
                    if (err) {
                        log(`Failed to get exchange connector for ${exchange.api_id}. Error: ${err.message}`);
                        return [];
                    }
                    let [fetcher, throttle] = con_result;
                    if (!fetcher || fetcher.loading_failed) {
                        
                        log(`[ERROR.3A]: Failed to find connector for exchange ${exchange.name} or failed to load exchange markets!`);
                        return [];
                    }

                    let mappings = associatedMappings[exchange.id];
                    let needed_ticker_data = [];
                    
                    if (fetcher.has.fetchTickers) { 
                        // fetch instrument market data all at once
                        log(`Fetching all market data from ${exchange.name}.`);
                        
                        let [err, all_ticker_data] = await to(throttle.throttledUnhandled(
                            fetcher.fetchTickers
                        )); // fetch all instrument data
                        log(`Finished fetching all tickers from ${exchange.name}`);
                        
                        if (err || _.isUndefined(all_ticker_data)) {
                            if (err) log(`Failed to fetch market data from ${exchange.name}, error: `, err.message);
                            else log(`Market data fetching request completed but response was empty for ${exchange.name}`);

                            return [];
                        }
                        
                        needed_ticker_data = _.map(mappings, mapping => { // check if received all data and return it
                            if (!all_ticker_data.hasOwnProperty(mapping.external_instrument_id)) { // no instrument found in data
                                log(`Market data from ${exchange.name} didn't include data for ${mapping.external_instrument_id}`);
                                
                                return [null, mapping];
                            }
                            
                            return [ all_ticker_data[mapping.external_instrument_id], mapping ];
                        });
                    } else {
                        // fetch instrument market data one by one because exchange doesn't support fetching all at once
                        needed_ticker_data = await Promise.all(
                            _.map(mappings, async (mapping) => {
                                log(`Fetching data from ${exchange.name} for symbol ${mapping.external_instrument_id}...`);

                                let [err, ticker] = await to(throttle.throttled( // fetch single instrument (slowed down)
                                    Promise.resolve([]), fetcher.fetchTicker, mapping.external_instrument_id
                                ));

                                if (err) { // couldn't get single instrument
                                    log(`Failed to fetch ${mapping.external_instrument_id} instrument market data from ${exchange.name}`);

                                    return [null, mapping];
                                }   

                                return [ ticker, mapping ];
                            })
                        )
                    }

                    // partition failed and successfully received data
                    [failed_instruments, fetched_market_data] = _.partition(needed_ticker_data, (market_data) => {
                        let [ticker, mapping] = market_data;
                        return !ticker || !_.isNumber(ticker.ask) || !_.isNumber(ticker.bid);
                    });

                    if (failed_instruments.length) {
                        await Promise.all(_.map(failed_instruments, (failed_instrument) => {
                            let [ticker, mapping] = failed_instrument;

                            let failed_prices = [];
                            if (!ticker) failed_prices.push('ask', 'bid'); 
                            else {
                                if (!_.isNumber(ticker.ask)) failed_prices.push('ask');
                                if (!_.isNumber(ticker.bid)) failed_prices.push('bid');
                            }

                            return logAction(actions.instrument_without_data, { 
                                args: {
                                    types: failed_prices,
                                    instruments: mapping.external_instrument_id,
                                    exchange: exchange.name,
                                },
                                relations: { exchange_id: exchange.id }
                            });
                        }));
                    } // check if the are failed to fetch instruments

                } catch (error) {
                    console.log(`Fetching and processing data from ${exchange.name} failed with error: ${error}`);
                }
                
                return fetched_market_data;
            })
        );
    }).then(ticker_data => {
        log(`4. Preparing ${ticker_data.length} entries`);

        let market_data = _(ticker_data)
        .flatten(ticker_data)
        .map(td => { // form an array
            let [ticker, mapping] = td;
            
            return {
                exchange_id: mapping.exchange_id,
                instrument_id: mapping.instrument_id,
                timestamp: ticker.timestamp? new Date(ticker.timestamp) : new Date(),
                ask_price: ticker.ask,
                bid_price: ticker.bid
            };
        })
        .value();

        log(`5. Saving ${market_data.length} fetched results...`);

        if (market_data.length > 0)
            return config.models.sequelize.queryInterface.bulkInsert('instrument_market_data', market_data);
        else
            return "No records inserted!";
    }).catch(async err => {
        log(`Job failed with error: ${err.message}`);
        await logAction(actions.job_error, {
            args: {
                error: err.message
            },
        });
    });
};