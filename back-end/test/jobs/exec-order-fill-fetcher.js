'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUtils = require('../../utils/CCXTUtils');

const execOrderFillFetcher= require('../../jobs/exec-order-fill-fetcher');

const sequelize = require('../../models/index').sequelize;
const Instrument = require('../../models').Instrument;
const ExecutionOrder = require('../../models').ExecutionOrder;
const ExecutionOrderFill = require('../../models').ExecutionOrderFill;

const { InProgress, PartiallyFilled, Failed, FullyFilled, NotFilled } = MODEL_CONST.EXECUTION_ORDER_STATUSES; 

/**
 * Mocked "fetchMyTrades" method.
 * @param {...Number} ids 
 */
const fetchMyTrades = (...ids) => {
    return () => {
        return Promise.resolve(MOCK_TRADES.filter(trade => ids.includes(trade.id)));
    }
};

/**
 * Mocked "fetchOrder" method.
 * @param {Number} id 
 */
const fetchOrder = (id) => {
    return Promise.resolve(MOCK_ORDERS.find(order => order.id === id));
};

/**
 * Mock "fetchOrder" and "fetchOpenOrders".
 * @param {...Number} ids 
 */
const fetchOrders = (...ids) => {
    return () => {
        return Promise.resolve(MOCK_ORDERS.filter(order => ids.includes(order.id))); 
    };
}

/**
 * Attempts to call the `restore` method on the provided symbols (method specified by `sinon`) 
 * 
 * `undefined` symbols are skipped, so are those without the method present.
 * @param symbols 
 */
const restoreSymbols = (...symbols) => {
    if (symbols.length > 0) {
        symbols.map(symbol => {
            if (symbol != null && symbol.restore) {
                symbol.restore();
            }
        })
    }
}

/**
 * Attempts to add a `save` method stub on all the provided symbols. 
 * The added `save` method returns the symbol itself wrapped in a resolved promise
 * 
 * `undefined` symbols are skipped
 * @param symbols 
 */
const stubSave = (...symbols) => {
    if (symbols.length > 0) {
        symbols.map(symbol => {
            if (symbol != null) {
                symbol.save = () => Promise.resolve(symbol);
            }
        });
    }
}

const stubChanged = (symbol, returnValue) => {
    if(symbol) symbol.changed = () => returnValue;
}

const MOCK_ORDERS = [{
    id: '1',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 6,
    status: 'open',
    price: 13223
}, {
    id: '2',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 10,
    status: 'open',
    price: 13223    
}, {
    id: '3',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 0,
    status: 'open',
    price: 13223
}, {
    id: '4',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 0,
    remaining: 10,
    status: 'closed',
    price: 13223
}, {
    id: '5',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 10,
    remaining: 0,
    status: 'closed',
    price: 13223
}, {
    id: '6',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 5,
    remaining: 5,
    status: 'open',
    price: 13223,
    fee: {
        cost: 1
    }
}, {
    id: '7',
    symbol: 'ETH/BTC',
    amount: 10,
    filled: 5,
    remaining: 5,
    status: 'closed',
    price: 13223,
    fee: {
        cost: 1
    }
}];

const MOCK_TRADES = [{
    id: '1',
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[0].symbol,
    order: MOCK_ORDERS[0].id,
    amount: 5,
    fee: {
        cost: 1
    }
}, {
    id: '2',
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[0].symbol,
    order: MOCK_ORDERS[0].id,
    amount: 2,
    fee: {
        cost: 2
    }
}, {
    id: '3',
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[4].symbol,
    order: MOCK_ORDERS[4].id,
    amount: 5,
    fee: {
        cost: 3
    }
}, {
    id: '4',
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[4].symbol,
    order: null,
    amount: 4,
    fee: {
        cost: 2
    },
    
}, {
    id: '5',
    timestamp: 1502962946216,
    symbol: MOCK_ORDERS[6].symbol,
    order: MOCK_ORDERS[6].id,
    amount: 4,
    fee: {
        cost: 2
    },
    
}];

const BASE_ORDER = {
    id: 1,
    placed_timestamp: new Date(),
    external_identifier: 1,
    exchange_id: 1,
    failed_attempts: 0,
    status: InProgress,
    total_quantity: 1,
    price: 1,
    type: 'market',
    side: 1,
    fee: 0,
    external_instrument: 'BTC/ETH',
    instrument_quote_asset_id: 1,
    instrument_quote_asset: 'ETH',
    instrument_transaction_asset_id: 2,
    instrument_transaction_asset: 'BTC',
    _previousDataValues: {
        failed_attempts: 0,
        status: InProgress,
        total_quantity: 1,
        price: 1,
        type: 'market',
        side: 1,
        fee: 0,
    },
    get(key) {
        return this[key];
    }
};

describe('Execution Order Fills fetcher job', () => {

    let stubbed_config = {
        models: {
            ExecutionOrder: ExecutionOrder,
            Instrument: Instrument,
            ExecutionOrderFill: ExecutionOrderFill,
            sequelize: sequelize
        }
    };

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
                                fetchMyTrades: true,
                                fetchOrder: true
                            },
                            fetchMyTrades: fetchMyTrades('1', '2', '3', '4', '5'),
                            fetchOrder: fetchOrder
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
                            fetchOrders: fetchOrders('1', '2')
                        };
                        break;

                    case 4:
                        connector = {
                            name: 'Exchange which has not methods.. somehow..',
                            has: {
                                nothing: true
                            }
                        };
                        break;
                    case 5:
                        connector = {
                            name: 'Exchange which will not fetch any orders',
                            has: {
                                fetchOrder: true
                            },
                            fetchOrder: fetchOrder
                        };
                        break;
                    case 6:
                        connector = {
                            name: 'Exchange has trade fetching, but does not point to wich order they belong to',
                            has: {
                                fetchOrder: true,
                                fetchMyTrades: true
                            },
                            fetchMyTrades: fetchMyTrades('4'),
                            fetchOrder: fetchOrder
                        };
                        break;
                }

                return Promise.resolve(connector);
            });

            sinon.stub(execOrderFillFetcher, 'isSimulated').callsFake(() => {
                return Promise.resolve(false);
            });

            done();
        });
    });

    afterEach(done => {
        restoreSymbols(
            ExecutionOrder.findAll,
            ExecutionOrderFill.sum,
            ExecutionOrderFill.findAll,
            ExecutionOrderFill.create,
            ExecutionOrderFill.bulkCreate,
            execOrderFillFetcher.isSimulated,
            sequelize.query,
            sequelize.transaction
        );
        
        done();
    });

    after(done => {
        ccxtUtils.getConnector.restore();
        done();
    });

    beforeEach(done => {
        sinon.stub(ccxtUtils, 'getThrottle').callsFake(id => {
            const throttle = {
                throttled: (d, fn, ...args) => Promise.resolve(fn(...args)),
                throttledUnhandled: (fn, ...args) => Promise.resolve(fn(...args))
            }

            return Promise.resolve(throttle);
        });

        done();
    });

    afterEach((done) => {
        if (ccxtUtils.getThrottle.restore) ccxtUtils.getThrottle.restore();

        done();
    });

    it('job body shall exist', () => {
        chai.expect(execOrderFillFetcher).to.exist;
    });

    it('shall increment the failed attempts by not finding a CCXT connection', () => {
        let order_with_invalid_exchanged_id = Object.assign({}, BASE_ORDER, {
            exchange_id: 99
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order_with_invalid_exchanged_id);
            stubChanged(order_with_invalid_exchanged_id, ['failed_attempts']);

            return Promise.resolve([order_with_invalid_exchanged_id]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order_with_invalid_exchanged_id);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {
            
            const failed_order = result[0].find(r => r.method === 'save').model;
 
            chai.expect(failed_order.failed_attempts).to.equal(1);

        });
    });

    it('shall increment the failed attempts by not finding the order on the exchange', () => {
        let order_with_invalid_external_identifier = Object.assign({}, BASE_ORDER, {
            external_identifier: '999',
            exchange_id: 2
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order_with_invalid_external_identifier);
            stubChanged(order_with_invalid_external_identifier, ['failed_attempts']);

            return Promise.resolve([order_with_invalid_external_identifier]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order_with_invalid_external_identifier);
        });


        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {
           
            const failed_order = result[0].find(r => r.method === 'save').model;

            chai.expect(failed_order.failed_attempts).to.equal(1);

        });

    });

    it('shall mark the execution order as NotFilled due to the order on the exchange was closed before getting filled at all', () => {
        let closed_order = Object.assign({}, BASE_ORDER, {
            exchange_id: 2,
            external_identifier: '4'
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(closed_order);
            stubChanged(closed_order, ['status']);

            return Promise.resolve([closed_order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(closed_order);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {

            const failed_order = result[0].find(r => r.method === 'save').model;

            chai.expect(failed_order.status).to.equal(NotFilled);

        });
    });

    it('shall mark the execution order as PartiallyFilled due to the order on the exchange was closed but was filled partially', () => {
        let closed_order = Object.assign({}, BASE_ORDER, {
            exchange_id: 1,
            external_identifier: '7'
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(closed_order);
            stubChanged(closed_order, ['status']);

            return Promise.resolve([closed_order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(closed_order);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {

            const failed_order = result[0].find(r => r.method === 'save').model;

            chai.expect(failed_order.status).to.equal(PartiallyFilled);

        });
    });

    it('shall mark the execution order as NotFilled when the failed attemts exceeds the system limit and was not filled at all', () => {
        let closed_order = Object.assign({}, BASE_ORDER, {
            exchange_id: 999,
            failed_attempts: SYSTEM_SETTINGS.EXEC_ORD_FAIL_TOLERANCE
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(closed_order);
            stubChanged(closed_order, ['status']);

            return Promise.resolve([closed_order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(closed_order);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {

            const failed_order = result[0].find(r => r.method === 'save').model;

            chai.expect(failed_order.status).to.equal(NotFilled);

        });
    });

    //No good way to test this ones here
    /*it('shall handle the fills using "handleFillsWithTrades" methods when fetching trades is available', () => {
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 1,
            external_identifier: '1'
        });

        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {
            stubSave(order);
            stubChanged(order, false);
            return Promise.resolve([order]);
        })

        sinon.stub(ExecutionOrderFill, 'sum').callsFake(() => {
            return Promise.resolve(0);
        });

        sinon.stub(execOrderFillFetcher, 'handleFillsWithTrades').callsFake((placed_order) => {
            return Promise.resolve(placed_order);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(orders => {

            chai.expect(execOrderFillFetcher.handleFillsWithTrades.calledOnce).to.be.true;

        });

    });

    it('shall handle the fills using "handleFillsWithoutTrades" when fetching trades is not available', () => {
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 2,
            external_identifier: '1'
        });

        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {
            stubSave(order);
            stubChanged(order, false);
            return Promise.resolve([order]);
        })

        sinon.stub(ExecutionOrderFill, 'sum').callsFake(() => {
            return Promise.resolve(0);
        });

        sinon.stub(execOrderFillFetcher, 'handleFillsWithoutTrades').callsFake((placed_order) => {
            return Promise.resolve(placed_order);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(orders => {

            chai.expect(execOrderFillFetcher.handleFillsWithoutTrades.calledOnce).to.be.true;
        });

    });

    it('shall switch to "handleFillsWithoutTrades" when fetching trades is available, but they don\'t have the order identifier', () => {
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 6,
            external_identifier: '1'
        });

        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {
            stubSave(order);
            stubChanged(order, false);
            return Promise.resolve([order]);
        })

        sinon.stub(ExecutionOrderFill, 'sum').callsFake(() => {
            return Promise.resolve(0);
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(() => {
            return Promise.resolve([]);
        });

        sinon.spy(execOrderFillFetcher, 'handleFillsWithTrades');

        sinon.stub(execOrderFillFetcher, 'handleFillsWithoutTrades').callsFake((placed_order) => {
            return Promise.resolve(placed_order);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(orders => {

            chai.expect(execOrderFillFetcher.handleFillsWithTrades.calledOnce).to.be.true;
            chai.expect(execOrderFillFetcher.handleFillsWithoutTrades.calledOnce).to.be.true;

        });

    });*/

    it('shall skip the cycle if there aren\'t any new trades that are not in the database yet', () => {
        
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 1,
            external_identifier: '1',
            status: EXECUTION_ORDER_STATUSES.PartiallyFilled
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order);
            stubChanged(order, null);

            return Promise.resolve([order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order);
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(() => {
            return Promise.resolve([{
                external_identifier: _.find(MOCK_TRADES, { id: '1' }).id,
                execution_order_id: order.id,
                timestamp: new Date()
            }, {
                external_identifier: _.find(MOCK_TRADES, { id: '2' }).id,
                execution_order_id: order.id,
                timestamp: new Date()
            }]);
        });


        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {
            
            chai.expect(result[0]).to.be.undefined;
        });

    });

    it('shall create a new fill when it fetches a new trade.', () => {
        
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 1,
            external_identifier: '1'
        });


        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order);
            stubChanged(order, ['fee']);

            return Promise.resolve([order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order);
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(() => {
            return Promise.resolve([{
                external_identifier: _.find(MOCK_TRADES, { id: '1' }).id,
                execution_order_id: order.id,
                fee: 0,
                price: 0,
                timestamp: new Date()
            }]);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {

            const placed_order = result[0].find(r => r.method === 'save').model;
            const new_fill = result[0].find(r => r.method === 'bulkCreate').args[0][0];

            const trade = _.find(MOCK_TRADES, { id: '2' });
            
            chai.expect(parseFloat(placed_order.fee)).to.equal(new_fill.fee);

            chai.expect(new_fill).to.be.an('object', 'bulkCreate did not receive a trade object');
            chai.expect(new_fill.execution_order_id).to.equal(order.id);
            chai.expect(new_fill.timestamp).to.equal(trade.timestamp);
            chai.expect(new_fill.external_identifier).to.equal(trade.id);
            chai.expect(new_fill.quantity).to.equal(trade.amount);
            chai.expect(new_fill.fee).to.equal(trade.fee.cost);
        });
        
    });

    it('shall skip the cycle if the sum of fills does is the same as the filled amount in the exchange order object', () => {
        
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 2,
            external_identifier: '1'
        });

        const mocked_order = _.find(MOCK_ORDERS, { id: '1' });
        const sum_of_fills = mocked_order.filled;

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order);
            stubChanged(order, false);

            return Promise.resolve([order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order);
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(() => {
            return Promise.resolve([{
                external_identifier: _.find(MOCK_TRADES, { id: '1' }).id,
                execution_order_id: order.id,
                quantity: sum_of_fills,
                timestamp: new Date()
            }]);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {

            chai.expect(result[0]).to.be.undefined;
        });

    });

    it('shall create a new fill when it filled amount exceeds the sum of fills inside the database.', () => {
        
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 2,
            external_identifier: '1'
        });

        const mocked_order = _.find(MOCK_ORDERS, { id: '1' });
        const sum_of_fills = mocked_order.filled / 3;

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order);
            stubChanged(order, true);

            return Promise.resolve([order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order);
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(() => {
            return Promise.resolve([{
                external_identifier: _.find(MOCK_TRADES, { id: '1' }).id,
                execution_order_id: order.id,
                quantity: sum_of_fills,
                timestamp: new Date()
            }]);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {
                  
            const new_fill = result[0].find(r => r.method === 'create').args[0];
            const partially_filled_order = result[0].find(r => r.method === 'save').model;

            chai.expect(partially_filled_order.status).to.equal(InProgress);

            chai.expect(new_fill).to.be.an('object', 'bulkCreate did not receive a trade object');
            chai.expect(new_fill.execution_order_id).to.equal(order.id);
            chai.expect(new_fill.timestamp).to.be.a('date');
            chai.expect(new_fill.external_identifier).to.be.undefined;
            chai.expect(parseFloat(new_fill.quantity)).to.equal(mocked_order.filled - sum_of_fills);
            chai.expect(new_fill.price).to.equal(partially_filled_order.price);
        });
        
    });

    it('shall mark the order as FullyFilled and saved the last fill', () => {
        
        let order = Object.assign({}, BASE_ORDER, {
            exchange_id: 1,
            external_identifier: '5'
        });

        sinon.stub(sequelize, 'query').callsFake(query => {
            stubSave(order);
            stubChanged(order, true);

            return Promise.resolve([order]);
        });

        sinon.stub(sequelize, 'transaction').callsFake(query => {
            return Promise.resolve(order);
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(() => {
            return Promise.resolve([]);
        });

        return execOrderFillFetcher.JOB_BODY(stubbed_config, console.log).then(result => {
            
            const new_fill = result[0].find(r => r.method === 'bulkCreate').args[0][0];
            const filled_order = result[0].find(r => r.method === 'save').model;

            chai.expect(filled_order.status).to.equal(FullyFilled);

            const trade = _.find(MOCK_TRADES, { id: '3' });

            chai.expect(new_fill).to.be.an('object', 'bulkCreate did not receive a trade object');
            chai.expect(new_fill.execution_order_id).to.equal(order.id);
            chai.expect(new_fill.timestamp).to.equal(trade.timestamp);
            chai.expect(new_fill.external_identifier).to.equal(trade.id);
            chai.expect(new_fill.quantity).to.equal(trade.amount);
        });

    });
    

});