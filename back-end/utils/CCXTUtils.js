'use strict';

const ccxt = require('ccxt');
const Exchange = require('../models').Exchange;

//connectors caches. same connectors but viewed through different keys
let con_by_id = {}, con_by_api = {};

const cache_init_promise = Exchange.findAll({}).then(exchanges => {

    _.mapValues(EXCHANGE_KEYS, exchange_options => {
        exchange_options.timeout = 120000 // request timeout after 120 seconds
    });
    
    const connectors = _.map(exchanges, exchange => {
        return [exchange.id, exchange.api_id, new ccxt[exchange.api_id](EXCHANGE_KEYS[exchange.api_id])];
    });

    _.forEach(connectors, ([id, api_id, connector]) => {

        con_by_id[id] = connector;
        con_by_api[api_id] = connector;
    });

    return Promise.all(_.map(connectors, ([id, api_id, connector]) => connector.load_markets()))
});

/**
 * Fetch the CCXT connector corresponding to supplied exchange data. The connector will have
 * associated markets (instruments) preloaded with data.
 * 
 * async to prevent race conditions while the connectors cache loads.
 * 
 * `exchange_data` - An identifying piece of exchange data, such as exchange id, exchange api_id or full exchange object 
 */
const getConnector = async (exchange_data) => {
    //ensure cache loaded
    await cache_init_promise;

    //fetch connector by parameter type

    //is numeric? JS has no good check, 
    //source: https://stackoverflow.com/a/16655847
    if (Number(parseFloat(exchange_data)) === exchange_data) {
        return con_by_id[exchange_data];
    }

    //is api_id string
    if (typeof exchange_data === 'string') {
        return con_by_api[exchange_data];
    }

    //is full object, try either cache
    if (typeof exchange_data === 'object') {
        let connector = con_by_id[exchange_data.id];
        if (connector == null) {
            connector = con_by_api[exchange_data.api_id];
        }

        return connector;
    }

    return null;
};
module.exports.getConnector = getConnector;

/**
 * Fetch all CCXT connectors currently in the cache, mapped to exchange id in DB. 
 * 
 * Optionally filtered to list of exchange ids provided
 * 
 * async to ensure loaded markets
 */
const allConnectors = async (exchange_ids = []) => {

    //await cache init
    await cache_init_promise;

    //return all connectors if no filter
    if (_.isNull(exchange_ids) || _.isEmpty(exchange_ids)) {
        return con_by_id
    } else {
        return _.pickBy(con_by_id, (con, id) => exchange_ids.includes(Number(id)))
    }
};
module.exports.allConnectors = allConnectors;