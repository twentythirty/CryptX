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
        console.log("------------------ mapping count: ", mappings.length);
        const associatedMappings = _.groupBy(mappings, 'exchange_id');
        const exchanges_with_mappings = _.filter(exchanges, exchange => associatedMappings[exchange.id]);

        return Promise.all(
            _.map(exchanges_with_mappings, async (exchange) => {

                const fetcher = await ccxtUtils.getConnector(exchange.api_id);
                const throttle = await ccxtUtils.getThrottle(exchange.api_id);

                let mappings = associatedMappings[exchange.id];
                let needed_ticker_data, failed_instruments = [];
                if (fetcher.has.fetchTickers) { // if can fetch all tickers at once
                    //(`Fetching all market data from ${exchange.name}.`);
                    
                    let [err, all_ticker_data] = await to(fetcher.fetchTickers()); // fetch all instrument data
                    if (err) {
                        //log(`Failed to fetch market data from ${exchange.name}`);
                        _.map(mappings, mapping => {
                            failed_instruments.push(mapping.external_instrument_id);
                        });
                        return [];
                    }

                    needed_ticker_data = _.map(mappings, mapping => { // check if received all data and return it
                        if (!all_ticker_data.hasOwnProperty(mapping.external_instrument_id)) { // no instrument found in data
                            //log(`Market data from ${exchange.name} didn't include data for ${mapping.external_instrument_id}`);
                            failed_instruments.push(mapping.external_instrument_id);
                            return [];
                        }
                        
                        return [ all_ticker_data[mapping.external_instrument_id], mapping ];
                    });
                } else { // if exchange only allows to fetch one ticker at the time

                    needed_ticker_data = await Promise.all(
                        _.map(mappings, async (mapping) => {
                            //log(`Fetching data from ${exchange.name} for symbol ${mapping.external_instrument_id}...`);

                            let [err, ticker] = await to(throttle.throttled( // fetch single instrument (slowed down)
                                Promise.resolve([]), fetcher.fetchTicker, mapping.external_instrument_id
                            ));
                            if (err) { // couldn't get single instrument
                                //log(`Failed to fetch ${mapping.external_instrument_id} instrument market data from ${exchange.name}`);
                                failed_instruments.push(mapping.external_instrument_id);
                                return [];
                            }

                            return [ ticker, mapping ];
                        })
                    )
                }

                needed_ticker_data.filter(ticker_data => {
                    let [ticker, mapping] = ticker_data;
                    if (!_.isNumber(ticker.ask) || !_.isNumber(ticker.bid)) {
                        console.log("------------- failed ticker: ", ticker, ', mapping of failed ticker: ', mapping);
                        failed_instruments.push(ticker_data.symbol);
                        return false;
                    } else {
                       // console.log("------------- not failed ticker: ", ticker, ', mapping of not failed ticker: ', mapping);

                        return true;
                    }
                });

                if (failed_instruments.length) // check if the are failed to fetch instruments
                    _.map(failed_instruments, (failed_instrument) => {
                        logAction(actions.instrument_without_data, { 
                            args: {
                                types: ['ask','bid'],
                                instruments: failed_instrument,
                                exchange: exchange.name,
                            },
                            relations: { exchange_id: exchange.id }
                        });
                    });

                // leave only instrument data was received
                needed_ticker_data = needed_ticker_data.filter(ticker => ticker.length);
                return needed_ticker_data;
            })
        );
    }).then(ticker_data => {
        console.log(ticker_data);
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


        console.log("------------------ market data count: ", market_data.length);

        log(`4. Saving ${market_data.length} fetched results...`);

        if (market_data.length > 0)
            return config.models.sequelize.queryInterface.bulkInsert('instrument_market_data', market_data);
        else
            return "No records inserted!";
    }).catch(err => {
        logAction(actions.job_error, {
            args: {
                error: err.message
            },
        });
    });
};