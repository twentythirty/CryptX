'use strict';

const ccxt = require('ccxt');
const Bottleneck = require('bottleneck');
const Exchange = require('../models').Exchange;
const ExchangeCredential = require('../models').ExchangeCredential;
const HttpsProxyAgent = require('https-proxy-agent');
const agent = new HttpsProxyAgent({
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
    secureProxy: true,
    headers: {
        'Proxy-Authorization': `Basic ${new Buffer(`${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}`).toString('base64')}`
    }
});

module.exports.proxy_agent = agent; //Since it is technically related only to exchanges, will export from here, for now.

const {
    logAction
} = require('../utils/ActionLogUtil');

//connectors caches. same connectors but viewed through different keys
let con_by_id = {},
    con_by_api = {};
let lim_by_id = {},
    lim_by_api = {};

//only fetch exchanges after app DB done loading
//this will need to be lazy loaded since DB not available on app startup
const cache_init_promise = async () => {
    const app = require('../app');
    return app.dbPromise.then(migrations => {
        return Exchange.findAll({
            include: ExchangeCredential
        })
    }).then(exchanges => {

        _.mapValues(EXCHANGE_KEYS, exchange_options => {
            exchange_options.timeout = 120000 // request timeout after 120 seconds
        });

        _.forEach(exchanges, exchange => {

            /**
             * For now, we only have one set of credentials per exchange, this might change in case we
             * use different keys for say READ and WRITE.
             * For now it will also default to ENV if the credentials were not found in the database.
             */
            const connector_options = Object.assign({ agent }, EXCHANGE_KEYS[exchange.api_id]);
            if(exchange.ExchangeCredentials.length) {

                const credentials = exchange.ExchangeCredentials[0];
                connector_options.apiKey = credentials.api_key_string;
                connector_options.secret = credentials.api_secret_string;
                
                _.assign(connector_options, credentials.additional_params_object);

            }

            const connector = new ccxt[exchange.api_id](connector_options);
            const throttle = {
                id: `LIM-${exchange.api_id}`,
                bottleneck: new Bottleneck({
                    id: `bottleneck-${exchange.api_id}`,
                    //request time multiplied when dealing with bitfinex due to strict limits policy
                    // with a one request per 0.5 seconds policy bitfinex will use one per 3 sec
                    minTime: exchange.api_id != 'bitfinex' ? CONFIG.ccxt_request_mintime : (CONFIG.ccxt_request_mintime * 6),
                    maxConcurrent: 1
                }),
                throttled: async (default_return, fn, ...args) => {
                    const throttler = lim_by_api[exchange.api_id];
                    //bind passed fn back to connector since CCXT uses `this.X` internally
                    const bound_fn = fn.bind(connector);

                    return throttler.bottleneck.schedule(() => {
                        if (process.env.NODE_ENV == 'dev') {
                            console.log(`Scheduling call to ${fn.name} on ${connector.name} for ${args}`)
                        }
                        return bound_fn(...args)
                    }).catch((error) => {
                        //error instanceof Bottleneck.prototype.BottleneckError can used for bottleneck-speicific
                        //error handling
                        //for now any error is logged and default value is returned
                        console.error(`\x1b[41m[LIMITER ${throttler.id}]\x1b[0m ERROR: ${error? error.message : 'N\\A'}`);
                        logAction('universal.error', {
                            args: {
                                error: `[${throttler.id}-${fn.name}-${args}]: ${error.message}`
                            },
                            log_level: ACTIONLOG_LEVELS.Error
                        });
                        return default_return;
                    })
                }
            }
            registerEvents(throttle.bottleneck);

            lim_by_id[exchange.id] = throttle;
            lim_by_api[exchange.api_id] = throttle;

            con_by_id[exchange.id] = connector;
            con_by_api[exchange.api_id] = connector;
        });

        _.forEach(con_by_id, (connector, id) => {
            //did the connector fail to load its markets and become unuseable
            connector.loading_failed = false

            //did the connector try loading its markets yet
            connector.markets_loaded = false
        })
    })
}


const from_exchange_data = async (map_id, map_api, exchange_data, resolve_markets = true) => {

    //ensure cache loaded
    if (_.isEmpty(map_id) || _.isEmpty(map_api)) {
        await cache_init_promise();
    }

    let connector = null;

    //fetch data by parameter type

    //is numeric? JS has no good check, 
    //source: https://stackoverflow.com/a/16655847
    if (Number(parseFloat(exchange_data)) === exchange_data) {
        connector = map_id[exchange_data];
    }

    //is api_id string
    if (connector == null && typeof exchange_data === 'string') {
        connector = map_api[exchange_data];
    }

    //is full object, try either cache
    if (connector == null && typeof exchange_data === 'object') {
        connector = map_id[exchange_data.id];
        if (connector == null) {
            connector = map_api[exchange_data.api_id];
        }
    }

    if (connector != null && resolve_markets) {

        if (connector.markets_loaded) {
            return connector;
        }
        await connector.loadMarkets().then(markets => {
            connector.markets_loaded = true;
            connector.loading_failed = false;

        }).catch(ex => {
            connector.markets_loaded = true;
            connector.loading_failed = true;

            //performing logging with relations
            const message = ex? ex.message : 'N\\A';
            let logOpts = {
                args: {
                    error: `[${connector.id}-load_markets]: ${message}`
                },
                log_level: ACTIONLOG_LEVELS.Error
            };
            //we can try get exchange id for relation if whats passed wasnt an api_id string
            if (typeof exchange_data !== 'string') {
                logOpts = Object.assign(logOpts, {
                    relations: {
                        exchange_id: (typeof exchange_data === 'object'? exchange_data.id : exchange_data)
                    }
                })
            }
            console.error(`\x1b[41m[CONNECTOR ${connector.id}]\x1b[0m ERROR: ${message}`);
            logAction('universal.error', logOpts);
        });

        return connector;
    } else {
        return connector;
    }
}

/**
 * Fetch the CCXT connector corresponding to supplied exchange data. The connector will have
 * associated markets (instruments) preloaded with data.
 * 
 * async to prevent race conditions while the connectors cache loads.
 * 
 * @param { String | Number | Object } exchange_data - An identifying piece of exchange data, such as exchange id, exchange api_id or full exchange object 
 * 
 * @returns { Object | null } the exchange connector or `null` if not found for this data. The connector migth FAIL to load data,
 * check the `loading_failed` boolean property before use
 */
const getConnector = async (exchange_data) => {
    return await from_exchange_data(con_by_id, con_by_api, exchange_data);
};
module.exports.getConnector = getConnector;

/**
 * Fetch the request limiter corresponding to supplied exchange data. 
 * The limiter can have a ccxt method passed into its `throttled` method to limit the execution speed.
 * 
 * The signature is `throttled(default, fn, ...args)`, where `default` gets returned if an error occurs during request process
 * 
 * The limiter also exposes an `id` property with the value `LIM-<exchange_api_id>` and the underlying `Bottleneck(options)` instance as `bottleneck`
 * 
 * async to prevent race conditions while the connectors cache loads.
 * 
  * @param { String | Number | Object } exchange_data - An identifying piece of exchange data, such as exchange id, exchange api_id or full exchange object  
 */
const getThrottle = async (exchange_data) => {
    return await from_exchange_data(lim_by_id, lim_by_api, exchange_data, false);
}
module.exports.getThrottle = getThrottle;

/**
 * Fetch all CCXT connectors currently in the cache, mapped to exchange id in DB. 
 * 
 * Optionally filtered to list of exchange ids provided
 * 
 * async to ensure loaded markets. If a list of exchange ids is provided, 
 * only the requested id markets get loaded
 * 
 * @param {Number[]} exchange_ids ids of exchanges to get connectors for
 */
const allConnectors = async (exchange_ids = []) => {

    //await cache init
    if (_.isEmpty(con_by_id) || _.isEmpty(lim_by_id)) {
        await cache_init_promise();
    }

    let connectors = {};
    //return all connectors if no filter
    if (_.isNull(exchange_ids) || _.isEmpty(exchange_ids)) {
        connectors = con_by_id
    } else {
        connectors = _.pickBy(con_by_id, (con, id) => exchange_ids.includes(Number(id)))
    }

    //make sure the connectors markets are loaded or attempted to
    for(let exchange_id of Object.keys(connectors)) {

        connectors[exchange_id] = await from_exchange_data(con_by_id, con_by_api, Number(exchange_id));
    }

    return connectors;
};
module.exports.allConnectors = allConnectors;



/**
 * Go through each limiter and add an error listener.
 * Currently, this will be only called if the job has an uncaught error (which they shouldn't). But in case one occurs, this will be called.
 * In case of clustering, Redis errors will go here.
 */
const registerEvents = async (...limiters) => {

    limiters.map(limiter => {
        limiter.on('error', error => {
            console.error(`\x1b[41m[LIMITER ${limiter.id}]\x1b[0m ERROR: ${error.message}`);
            logAction('universal.error', {
                args: {
                    error: error.message
                },
                log_level: ACTIONLOG_LEVELS.Error
            });
        });
    });
}