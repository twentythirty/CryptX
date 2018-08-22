'use strict';
const ccxt = require('ccxt');
const ccxtUtils = require('../utils/CCXTUtils')
const { logAction } = require('../utils/ActionLogUtil');

const actions = {
    error: 'universal.error',
    warning: 'universal.warning'
};

//run once per day at midnight
module.exports.SCHEDULE = '0 0 * * *';
module.exports.NAME = 'EXCH_VOL24';

module.exports.JOB_BODY = async (config, log) => {

    log('1. Fetch all active exchanges...');

    return config.models.Exchange.findAll().then(async exchanges => {

        log(`2. Fetch associated exchange mappings for ${exchanges.length} exchanges...`);

        let [ err, mappings ] = await to(config.models.InstrumentExchangeMapping.findAll({
            where: {
                exchange_id: _.map(exchanges, 'id')
            }
        }));

        if(err) {
            log(`[ERROR.2A]: ${err.message}`);
            logAction(actions.error, {
                args: { error: err.message },
                log_level: LOG_LEVELS.Error
            });

            return;
        }
        
        log(`3. Build CCXT connectors and fetch associated symbols info`);

        const associatedMappings = _.groupBy(mappings, 'exchange_id');
        const exchanges_with_mappings = _.filter(exchanges, exchange => associatedMappings[exchange.id]);

        let data = null;
        [ err, data ] = await to(Promise.all(_.map(exchanges_with_mappings, async (exchange) => {
            const mappings = associatedMappings[exchange.id];
            log(`Building volume fetcher for ${exchange.name} with ${mappings.length} mappings...`);

            const fetcher = await ccxtUtils.getConnector(exchange.api_id);

            //promise pairs made of arrays where [exchange, [mapping, fetched-data]]
            return Promise.all([
                Promise.resolve(exchange),
                Promise.all(_.map(mappings, mapping => {
                    log(`Fetching volume for ${exchange.name} on symbol ${mapping.external_instrument_id}...`);

                    //promise pairs made of arrays where [symbol mapping, fetched-data]
                    return Promise.all([
                        Promise.resolve(mapping),
                        //wrap exchange promise into a promise that returns empty array if broken
                        Promise.resolve(fetcher.fetch_ticker(mapping.external_instrument_id)).catch(err => {
                            return []
                        })
                    ]);
                }))
            ])
        })));

        if(err) {
            log(`[ERROR.3A]: ${err.message}`);
            logAction(actions.error, {
                args: { error: err.message },
                log_level: LOG_LEVELS.Error
            });

            return;
        }

        log(`4. Saving fetched results...`);

        const records = _.flatMap(data, ([exchange, markets_data]) => {

            // filter out empty market_data.baseVolume, there's no need to save to DB
            markets_data = markets_data.filter(
                ([symbol_mapping, market_data]) => market_data.baseVolume != null
            );

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
        
        if(!records.length) {
            log(`[WARN.4A]: Job received 0 records.`);
            logAction(actions.warning, {
                args: { warning: 'Job received 0 records' },
                log_level: LOG_LEVELS.Warning
            });

            return;
        };

        [ err, data ] = await to(config.models.sequelize.queryInterface.bulkInsert('instrument_liquidity_history', records));

        if(err) {
            log(`[ERROR.4A]: ${err.message}`);
            logAction(actions.error, {
                args: { error: err.message },
                log_level: LOG_LEVELS.Error
            });

            return;
        }

        return data;
    });
};