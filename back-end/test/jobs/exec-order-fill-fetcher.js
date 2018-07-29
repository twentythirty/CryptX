'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUtils = require('../../utils/CCXTUtils');

const execOrderFillFetcher= require('../../jobs/exec-order-fill-fetcher');

const Instrument = require('../../models').Instrument;
const ExecutionOrder = require('../../models').ExecutionOrder;
const ExecutionOrderFill = require('../../models').ExecutionOrderFill;

/**
 * Mocked "fetchMyTrades" method.
 * @param {...Number} ids 
 */
const fetchMyTrades = (...ids) => {
    return () => {
        return MOCK_TRADES.filter(trade => ids.includes(trade.id));
    }
};

/**
 * Mocked "fetchOrder" method.
 * @param {Number} id 
 */
const fetchOrder = (id) => {
    return MOCK_ORDERS.find(order => order.id === id);
};

/**
 * Mock "fetchOrder" and "fetchOpenOrders".
 * @param {...Number} ids 
 */
const fetchOrders = (...ids) => {
    return () => {
        return MOCK_ORDERS.filter(order => ids.includes(order.id)); 
    };
}

const MOCK_ORDERS = [{
    id: 1,
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 6
}, {
    id: 2,
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 10
}, {
    id: 3,
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 0
}];

const MOCK_TRADES = [{
    id: 1,
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[0].symbol,
    order: MOCK_ORDERS[0].id,
    amount: 5
}, {
    id: 2,
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[0].symbol,
    order: MOCK_ORDERS[0].id,
    amount: 2
}, {
    id: 3,
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[1].symbol,
    order: MOCK_ORDERS[1].id,
    amount: 5
}, {
    id: 4,
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[0].symbol,
    order: null,
    amount: 4
}];

describe('Execution Order Fills fetcher job', () => {

    before(done => {
        app.dbPromise.then(migrations => {
            console.log('Migrations: %o', migrations);

            sinon.stub(ccxtUtils, 'getConnector').callsFake(exchange => {
                let connector = null;

                switch(exchange) {
                    case 1:
                        connector = {
                            name: 'Exchange with fetchMyTrades',
                            has: {
                                fetchTrades: true
                            },
                            fetchMyTrades: fetchMyTrades(1, 2)
                        };
                        break;
                    
                    case 2:
                        connector = {
                            name: 'Exchange with fetchOrder',
                            has: {
                                fetchOrder: true
                            },
                            fetchOrder: fetchOrder
                        };
                        break;

                    case 3:
                        connector = {
                            name: 'Exchange with only fetchOrders',
                            has: {
                                fetchOrders: true
                            },
                            fetchOrders: fetchOrders(1, 2)
                        };
                        break;

                    case 4:
                        connector = {
                            name: 'Exchange which has not methods.. somehow..',
                            has: {
                                nothing: true
                            }
                        };
                }

                return Promise.resolve(connector);
            });
        });
    });

    after(done => {
        ccxtUtils.getConnector.restore();
    });

});