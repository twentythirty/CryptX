'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUtils = require('../../utils/CCXTUtils');
const ccxtUnified = require('../../utils/ccxtUnified');

const execOrderGenerator = require('../../jobs/exec-order-generator');

const RecipeOrder = require('../../models').RecipeOrder;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;
const Instrument = require('../../models').Instrument;
const ExecutionOrder = require('../../models').ExecutionOrder;
const ExecutionOrderFill = require('../../models').ExecutionOrderFill;
const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
const sequelize = require('../../models').sequelize;

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

describe('Execution Order generator job', () => {

    let stubbed_config = {
        models: {
            RecipeOrder: RecipeOrder,
            RecipeOrderGroup: RecipeOrderGroup,
            ExecutionOrder: ExecutionOrder,
            Instrument: Instrument,
            ExecutionOrderFill: ExecutionOrderFill,
            InstrumentExchangeMapping: InstrumentExchangeMapping,
            sequelize: sequelize
        }
    };

    before(done => {
        app.dbPromise.then(migrations => {
            console.log('Migrations: %o', migrations);

            sinon.stub(RecipeOrderGroup, 'findAll').callsFake(options => {
                return Promise.resolve([]);
            });

            done();
        });
    });

    //This is done before each test, as some may modify this stub.
    beforeEach(done => {
        sinon.stub(ccxtUtils, 'getConnector').callsFake(exhange => {
            const connector = {
                name: 'Mock exchange',
                markets: {
                    'LTC/BTC': {
                        limits: {
                            amount: {
                                min: 0,
                                max: 1000000
                            },
                            price: {
                                min: 0, //Set to 0 to make sure tests with random price pass always.
                                max: 1000000
                            }
                        },
                        active: true
                    }
                }
            };

            return Promise.resolve(connector);
        });

        sinon.stub(ccxtUnified, "getExchange").callsFake((name) => {
            let exchange = class Exchange {
                
                constructor () {
                    this._connector = {
                        name: 'Mock exchange',
                        markets: {
                            'LTC/BTC': {
                                limits: {
                                    amount: {
                                        min: 0,
                                        max: 1000000
                                    },
                                    price: {
                                        min: 0, //Set to 0 to make sure tests with random price pass always.
                                        max: 1000000
                                    }
                                },
                                active: true
                            }
                        }
                    };
                    this.api_id = name;
                }

                async isReady() {
                    return Promise.resolve();
                }

                async createMarketOrder () {
                    return {
                        id: '123',
                        timestamp: 1532444115700,
                        datetime: '2018-07-24T14:55:15.700Z',
                        lastTradeTimestamp: undefined,
                        symbol: 'LTC/BTC',
                        type: 'market',
                        side: 'buy',
                        price: 0,
                        amount: 1,
                        cost: 0,
                        filled: 1,
                        remaining: 0,
                        status: 'closed',
                        fee: undefined,
                        trades: undefined
                    }
                }


                async getSymbolLimits () {
                    return {
                        spend: {
                            min: 0.00001,
                            max: 500
                        }
                    };
                }
            }
      
            return Promise.resolve(new exchange());
        });

        done();
    });

    after(done => {

        RecipeOrderGroup.findAll.restore();
        done();
    });

    afterEach(done => {
        if (ccxtUtils.getConnector.restore) ccxtUtils.getConnector.restore();
        if (ccxtUnified.getExchange.restore) ccxtUnified.getExchange.restore();
        done();
    });


    const TEST_PENDING_ORDER_BASE = {
        status: RECIPE_ORDER_STATUSES.Pending,
        side: ORDER_SIDES.Buy,
    }
    const PENDING_ORDER_IDS = [488, 512, 569, 599]; //ids for testing various pending orders
    const PENDING_ORDER_QNTY = 2.0;
    const PENDING_ORDER_PRICE = 0.25;

    const PRICE_PER_ASSET = 6500;
    const SPEND_AMOUNT = 2 / 6500;

    const TEST_SYMBOL_PENDING_ORDER_BASE = Object.assign({}, TEST_PENDING_ORDER_BASE, {
        id: PENDING_ORDER_IDS[0],
        quantity: PENDING_ORDER_QNTY,
        spend_amount: SPEND_AMOUNT,
        price: PENDING_ORDER_PRICE,
        Instrument: {
            symbol: 'LTC/BTC'
        },
        instrument_id: 361,
        target_exchange_id: 77
    });
    const EXECUTION_ORDER_IDS = [7845, 3248, 6314, 1111];

    const TEST_PENDING_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[0],
        status: EXECUTION_ORDER_STATUSES.Pending
    }
    const TEST_PARTIAL_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[1],
        status: EXECUTION_ORDER_STATUSES.InProgress
    }
    const TEST_FILLED_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[2],
        status: EXECUTION_ORDER_STATUSES.FullyFilled
    }


    it("job body shall exist", () => {
        chai.expect(execOrderGenerator.JOB_BODY).to.exist;
    });

    it("shall skip pending recipe order with invalid sale currency", () => {
        let empty_order = Object.assign({
            Instrument: {
                symbol: 'XRP/LTC'
            }
        }, TEST_PENDING_ORDER_BASE);
        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            stubSave(empty_order);
            return Promise.resolve([empty_order]);
        });
        sinon.stub(sequelize, 'query').callsFake(() => {
            console.log("Sequelize query called from: shall skip pending recipe order with invalid sale currency");
            return [];
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(processed_recipes => {
            sequelize.query.restore();

            restoreSymbols(RecipeOrder.findAll);

            const [failed_recipe] = processed_recipes;

            chai.expect(failed_recipe.instance).to.deep.equal(empty_order, "Order should not have changed!");
            //should not ahve generated any new execution orders!
            chai.expect(failed_recipe.status).to.equal(JOB_RESULT_STATUSES.Error);
            chai.expect(failed_recipe.step).to.equal('2A');
        });
    });

    it("shall skip pending recipe orders with bad execution order states", () => {

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            let pending_order1 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE);
            let pending_order2 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[1]
            });
            stubSave(pending_order1, pending_order2);
            return Promise.resolve([pending_order1, pending_order2]);
        });
        sinon.stub(sequelize, 'query').callsFake((query, options) => {
            let exec_stats = {
                status: 63,
                execution_order_count: "1339",
                spend_amount: 700,
                total_quantity: "20118962",
                filled: "20118962"
            };

            switch (options.replacements.recipe_order_id) {
                case PENDING_ORDER_IDS[0]:
                    return Promise.resolve([
                        Object.assign(exec_stats, {
                            status: EXECUTION_ORDER_STATUSES.Pending
                        })
                    ]);
                case PENDING_ORDER_IDS[1]:
                    return Promise.resolve([
                        Object.assign(exec_stats, {
                            status: EXECUTION_ORDER_STATUSES.InProgress
                        })
                    ]);
                default:
                    return Promise.resolve([]);
            }
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                /* ExecutionOrder.findAll, */
                sequelize.query
            );

            const [failed_order, marked_order] = orders;

            chai.assert.isDefined(failed_order);
            chai.assert.isDefined(marked_order);

            chai.expect(failed_order).is.not.a('array');
            chai.expect(marked_order).is.not.a('array');

            chai.expect(failed_order.instance.status).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.status, `Status changed for ${failed_order.id}`);
            chai.expect(failed_order.status).to.equal(JOB_RESULT_STATUSES.Skipped);
            chai.expect(failed_order.step).to.equal('3A');

            chai.expect(marked_order.instance.status).to.eq(TEST_PENDING_ORDER_BASE.status, `Status changed for ${marked_order.id}`);
            chai.expect(marked_order.status).to.equal(JOB_RESULT_STATUSES.Skipped);
            chai.expect(marked_order.step).to.equal('3A');
        });
    });

    it("shall skip pending orders if the corresponding exchange/instrument mapping pair is missing", () => {

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            let pending_order2 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[1]
            });
            stubSave(pending_order2);
            return Promise.resolve([pending_order2]);
        });
        sinon.stub(sequelize, 'query').callsFake((query, options) => Promise.resolve([]));
        sinon.stub(InstrumentExchangeMapping, 'find').callsFake(options => {
            return Promise.resolve(new InstrumentExchangeMapping(options.where))
        });
        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(options => {
            return Promise.resolve([])
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                /* ExecutionOrder.findAll, */
                sequelize.query,
                InstrumentExchangeMapping.find,
                ExecutionOrderFill.findAll
            );

            const [recipe_order] = orders;

            chai.assert.isDefined(recipe_order);

            chai.expect(recipe_order).is.not.a('array');

            chai.expect(recipe_order.instance.status).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.status, `Status changed for ${recipe_order.id}`);
            chai.expect(recipe_order.status).to.equal(JOB_RESULT_STATUSES.Error);
            chai.expect(recipe_order.step).to.equal('3A');
        });
    });

    it("shall skip a pending order if execution order fills cover its initial quantity", () => {

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            let pending_order2 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[1]
            });
            stubSave(pending_order2);
            return Promise.resolve([pending_order2]);
        });
        sinon.stub(InstrumentExchangeMapping, 'find').callsFake(options => {
            return Promise.resolve(new InstrumentExchangeMapping(Object.assign(options.where, {
                tick_size: 0.5
            })))
        });
        sinon.stub(sequelize, 'query').callsFake((query, options) => {
            let exec_stats = {
                status: EXECUTION_ORDER_STATUSES.FullyFilled,
                execution_order_count: "1339",
                spend_amount: PENDING_ORDER_QNTY / PRICE_PER_ASSET,
                //total_quantity: PENDING_ORDER_QNTY,
                filled: PENDING_ORDER_QNTY / PRICE_PER_ASSET
            };

            return Promise.resolve([exec_stats]);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                InstrumentExchangeMapping.find,
                ExecutionOrderFill.findAll,
                sequelize.query
            );

            chai.expect(orders.length).to.eq(1);
            const [finished_order] = orders;

            chai.expect(finished_order).to.not.be.a('array');

            chai.expect(finished_order.instance.status).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.status, "Order status chagned!");
            chai.expect(finished_order.status).to.equal(JOB_RESULT_STATUSES.Skipped);
            chai.expect(finished_order.step).to.equal('3B');
        });
    });

    it("shall create an extra chunky execution order if the post-order quantity is lower than the exchange trading threshold", () => {
        ccxtUtils.getConnector.restore();
        const CONNECTOR_MIN = 400;
        sinon.stub(ccxtUtils, 'getConnector').callsFake(exhange => {
            const connector = {
                name: 'Mock exchange',
                markets: {
                    'LTC/BTC': {
                        limits: {
                            amount: {
                                min: CONNECTOR_MIN,
                                max: 1000000
                            },
                            price: {
                                min: CONNECTOR_MIN,
                                max: 1000000
                            }
                        },
                        active: true
                    }
                }

            };

            return Promise.resolve(connector);
        });


        let not_completed_order = Object.assign({

        }, TEST_SYMBOL_PENDING_ORDER_BASE, {
            id: PENDING_ORDER_IDS[2],
            quantity: (CONNECTOR_MIN * 2 - 1)
        });
        sinon.stub(sequelize, 'query').callsFake((query, options) => {
            let exec_stats = {
                status: EXECUTION_ORDER_STATUSES.FullyFilled,
                execution_order_count: "1339",
                total_quantity: 1,
                filled: 1
            };
            if (options.replacements) {
                switch (options.replacements.recipe_order_id) {
                    case PENDING_ORDER_IDS[0]:
                        return Promise.resolve([
                            Object.assign(exec_stats, {
                                status: EXECUTION_ORDER_STATUSES.Pending
                            })
                        ]);
                    case PENDING_ORDER_IDS[1]:
                        return Promise.resolve([
                            Object.assign(exec_stats, {
                                status: EXECUTION_ORDER_STATUSES.InProgress
                            })
                        ]);
                    default:
                        return Promise.resolve([]);
                }
            } else {
                return Promise.resolve([]);
            }
        });
        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            stubSave(not_completed_order);
            return Promise.resolve([not_completed_order]);
        });
        sinon.stub(InstrumentExchangeMapping, 'find').callsFake(options => {
            return Promise.resolve(new InstrumentExchangeMapping(Object.assign(options.where, {
                tick_size: 0.5
            })))
        });

        //Make sure the order is unfilled yet.
        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(options => {
            return Promise.resolve([
                new ExecutionOrderFill({
                    quantity: 1,
                    id: 1
                })
            ])
        });
        sinon.stub(ExecutionOrder, 'create').callsFake(options => {

            return Promise.resolve(options);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(processed_recipes => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrder.findAll,
                ExecutionOrder.create,
                ExecutionOrderFill.findAll,
                InstrumentExchangeMapping.find,
                sequelize.query
            );

            const [
                [recipe, execution_order]
            ] = processed_recipes;

            chai.expect(execution_order).to.be.not.undefined;
            chai.expect(execution_order.spend_amount).to.equal('' + not_completed_order.spend_amount)
        });

    });

    it("will create next step of execution orders with the total set to the markers max limit", () => {
        ccxtUtils.getConnector.restore();
        sinon.stub(ccxtUtils, 'getConnector').callsFake(exhange => {
            const connector = {
                name: 'Mock exchange',
                markets: {
                    'LTC/BTC': {
                        limits: {
                            amount: {
                                min: 0,
                                max: 0.1
                            },
                            price: {
                                min: 0,
                                max: 0.1
                            }
                        },
                        active: true
                    }
                }

            };

            return Promise.resolve(connector);
        });


        let not_completed_order = Object.assign({

        }, TEST_SYMBOL_PENDING_ORDER_BASE, {
            id: PENDING_ORDER_IDS[3]
        });

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            stubSave(not_completed_order);
            return Promise.resolve([not_completed_order]);
        });
        sinon.stub(InstrumentExchangeMapping, 'find').callsFake(options => {
            return Promise.resolve(new InstrumentExchangeMapping(Object.assign(options.where, {
                tick_size: 0.000000005
            })))
        });

        sinon.stub(sequelize, 'query').callsFake((query, options) => {
            let exec_stats = {
                status: EXECUTION_ORDER_STATUSES.FullyFilled,
                execution_order_count: "1339",
                total_quantity: 1,
                spend_amount: SPEND_AMOUNT / 2,
                filled: 1
            };

            switch (options.replacements.recipe_order_id) {
                /* case PENDING_ORDER_IDS[0]:
                    return Promise.resolve([
                        Object.assign(exec_stats, { 
                            status: EXECUTION_ORDER_STATUSES.Pending
                        })
                    ]); */
                /* case PENDING_ORDER_IDS[1]:
                    return Promise.resolve([
                        Object.assign(exec_stats, { 
                            status: EXECUTION_ORDER_STATUSES.InProgress
                        })
                    ]); */
                default:
                    return Promise.resolve([exec_stats]);
            }
        });

        sinon.stub(ExecutionOrder, 'create').callsFake(options => {

            return Promise.resolve(options);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(processed_recipes => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrderFill.findAll,
                InstrumentExchangeMapping.find,
                ExecutionOrder.create,
                sequelize.query
            );
            //console.log(processed_recipes);
            const [
                [recipe, execution_order]
            ] = processed_recipes;

            chai.expect(execution_order).to.be.not.undefined;
            chai.expect(execution_order.spend_amount).to.greaterThan(0.0);
        });
    });

    it("will create next step of execution orders when conditions are good", () => {

        const low_total_qnty = SYSTEM_SETTINGS.BASE_BTC_TRADE / 2;

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            //order with usual qnty
            let pending_order1 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[0]
            });
            //order with less quantity than randomly decided
            let pending_order2 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[1],
                quantity: low_total_qnty
            });
            stubSave(pending_order1, pending_order2);
            return Promise.resolve([pending_order1, pending_order2]);
        });

        sinon.stub(sequelize, 'query').callsFake((query, options) => {


            switch (options.replacements.recipe_order_id) {
                case PENDING_ORDER_IDS[0]:
                    let exec_stats = {
                        status: EXECUTION_ORDER_STATUSES.FullyFilled,
                        execution_order_count: "1339",
                        total_quantity: PENDING_ORDER_QNTY / 2 / 2,
                        spend_amount: SPEND_AMOUNT / 2 / 2,
                        filled: PENDING_ORDER_QNTY / 2 / 2
                    };
                    return Promise.resolve([
                        Object.assign(exec_stats, {
                            status: EXECUTION_ORDER_STATUSES.filled
                        })
                    ]);
                    /* case PENDING_ORDER_IDS[1]:
                        return Promise.resolve([
                            Object.assign(exec_stats, { 
                                status: EXECUTION_ORDER_STATUSES.InProgress
                            })
                        ]); */
                default:
                    return Promise.resolve([]);
            }
        });

        sinon.stub(ExecutionOrder, 'create').callsFake(options => {

            return Promise.resolve(options);
        });
        sinon.stub(InstrumentExchangeMapping, 'find').callsFake(options => {
            return Promise.resolve(new InstrumentExchangeMapping(Object.assign(options.where, {
                tick_size: SYSTEM_SETTINGS.BASE_BTC_TRADE / 3
            })))
        });
        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(options => {
            return Promise.resolve([]);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders_and_execution_orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrder.findAll,
                ExecutionOrder.create,
                ExecutionOrderFill.findAll,
                InstrumentExchangeMapping.find,
                sequelize.query
            );

            const [parent_and_line_order, parent_and_whole_order] = orders_and_execution_orders;
            console.log(parent_and_line_order, parent_and_whole_order);
            const [parent_line, line_order] = parent_and_line_order;
            const [parent_whole, whole_order] = parent_and_whole_order;

            chai.assert.isDefined(line_order);
            chai.assert.isDefined(whole_order);

            //returned execution orders with correct initial status
            chai.expect(line_order.status).to.eq(EXECUTION_ORDER_STATUSES.Pending);
            chai.expect(whole_order.status).to.eq(EXECUTION_ORDER_STATUSES.Pending);

            //parent orders expected ot become executing
            chai.expect(parent_line.status).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.status, "recipe order status changed!");
            chai.expect(parent_whole.status).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.status, "recipe order status changed!");

            const execution_orders = [line_order, whole_order];

            //common data was written in correctly
            _.forEach(execution_orders, (order, idx) => {
                chai.expect(order.instrument_id).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.instrument_id);
                chai.expect(order.exchange_id).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.target_exchange_id);
                chai.expect(order.type).to.eq(EXECUTION_ORDER_TYPES.Market);
                chai.expect(order.recipe_order_id).to.eq(PENDING_ORDER_IDS[idx]);
            });

            //correct quantity was used for line order even though theres more quantity left
            chai.assert.closeTo(parseFloat(line_order.total_quantity), SYSTEM_SETTINGS.BASE_BTC_TRADE, SYSTEM_SETTINGS.TRADE_BASE_FUZYNESS);
            //quantity in order was capped to total available
            chai.assert.isAtMost(whole_order.total_quantity, low_total_qnty);
        });
    });

    it("shall create an extra chunky execution order if the post-order quantity is lower than the exchange trading threshold", () => {
        ccxtUtils.getConnector.restore();
        if (ccxtUnified.getExchange.restore) ccxtUnified.getExchange.restore();

        const limits = { 
            amount: {
                min: 0,
                max: 1000000
            },
            price: {
                min: 0, //Set to 0 to make sure tests with random price pass always.
                max: 1000000
            },
            spend: {
                min: 1,
                max: 500
            } 
        };

        sinon.stub(ccxtUnified, "getExchange").callsFake((name) => {
            let exchange = class Exchange {
                
                constructor () {
                    this._connector = {
                        name: 'Mock exchange',
                        markets: {
                            'LTC/BTC': {
                                limits,
                                active: true
                            }
                        }
                    };
                    this.api_id = name;
                }

                async isReady() {
                    return Promise.resolve();
                }

                async getSymbolLimits () {
                    return limits;
                }
            }
      
            return Promise.resolve(new exchange());
        });

        let not_completed_order = Object.assign({

        }, TEST_SYMBOL_PENDING_ORDER_BASE, {
            id: PENDING_ORDER_IDS[2],
            spend_amount: 0.1
        });
        sinon.stub(sequelize, 'query').callsFake((query, options) => {
            let exec_stats = {
                status: EXECUTION_ORDER_STATUSES.FullyFilled,
                execution_order_count: "1339",
                total_quantity: 1,
                spend_amount: 0.1,
                filled: 1
            };
            if (options.replacements) {
                switch (options.replacements.recipe_order_id) {
                    case PENDING_ORDER_IDS[0]:
                        return Promise.resolve([
                            Object.assign(exec_stats, {
                                status: EXECUTION_ORDER_STATUSES.Pending
                            })
                        ]);
                    case PENDING_ORDER_IDS[1]:
                        return Promise.resolve([
                            Object.assign(exec_stats, {
                                status: EXECUTION_ORDER_STATUSES.InProgress
                            })
                        ]);
                    default:
                        return Promise.resolve([]);
                }
            } else {
                return Promise.resolve([]);
            }
        });
        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            stubSave(not_completed_order);
            return Promise.resolve([not_completed_order]);
        });
        sinon.stub(InstrumentExchangeMapping, 'find').callsFake(options => {
            return Promise.resolve(new InstrumentExchangeMapping(Object.assign(options.where, {
                tick_size: 0.5
            })))
        });

        sinon.stub(ExecutionOrder, 'create').callsFake(options => {

            return Promise.resolve(options);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(processed_recipes => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrder.findAll,
                ExecutionOrder.create,
                ExecutionOrderFill.findAll,
                InstrumentExchangeMapping.find,
                sequelize.query
            );

            const recipe = processed_recipes[0].instance;

            chai.expect(recipe.stop_gen).to.be.equal(true);
        });

    });
});