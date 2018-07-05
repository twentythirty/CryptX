'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const execOrderGenerator = require('../../jobs/exec-order-generator');

const RecipeOrder = require('../../models').RecipeOrder;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;
const Instrument = require('../../models').Instrument;
const ExecutionOrder = require('../../models').ExecutionOrder;


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
            Instrument: Instrument
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

    after(done => {

        RecipeOrderGroup.findAll.restore();
        done();
    });

    const TEST_PENDING_ORDER_BASE = {
        status: RECIPE_ORDER_STATUSES.Pending,
        side: ORDER_SIDES.Buy,
    }
    const PENDING_ORDER_IDS = [488, 512]; //ids for testing various pending orders
    const PENDING_ORDER_QNTY = 2.0;
    const PENDING_ORDER_PRICE = _.random();
    const TEST_SYMBOL_PENDING_ORDER_BASE = Object.assign({}, TEST_PENDING_ORDER_BASE, {
        id: PENDING_ORDER_IDS[0],
        quantity: PENDING_ORDER_QNTY,
        price: PENDING_ORDER_PRICE,
        Instrument: {
            symbol: 'LTC/BTC'
        },
        instrument_id: 361,
        target_exchange_id: 77
    });
    const EXECUTION_ORDER_IDS = [7845, 3248, 6314, 1111];
    const TEST_FAILED_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[0],
        status: EXECUTION_ORDER_STATUSES.Failed
    }
    const TEST_PARTIAL_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[1],
        status: EXECUTION_ORDER_STATUSES.Placed
    }
    const TEST_FILLED_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[2],
        status: EXECUTION_ORDER_STATUSES.FullyFilled
    }
    const TEST_CANCELLED_EXECUTION_ORDER = {
        id: EXECUTION_ORDER_IDS[3],
        status: EXECUTION_ORDER_STATUSES.Cancelled
    }


    it("job body shall exist", () => {
        chai.expect(execOrderGenerator.JOB_BODY).to.exist;
    });

    it("shall fail pending recipe order with invalid sale currency", () => {

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            let empty_order = Object.assign({
                Instrument: {
                    symbol: 'XRP/LTC'
                }
            }, TEST_PENDING_ORDER_BASE);
            stubSave(empty_order);
            return Promise.resolve([empty_order]);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(processed_recipes => {

            restoreSymbols(RecipeOrder.findAll);

            const [failed_recipe] = processed_recipes;
            chai.expect(failed_recipe.status).to.eq(RECIPE_ORDER_STATUSES.Failed);
        });
    });

    it("shall shift pending recipe orders with bad execution order states", () => {

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            let pending_order1 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE);
            let pending_order2 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[1]
            });
            stubSave(pending_order1, pending_order2);
            return Promise.resolve([pending_order1, pending_order2]);
        });
        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {
            switch (options.where.recipe_order_id) {
                case PENDING_ORDER_IDS[0]:
                    return Promise.resolve([TEST_FAILED_EXECUTION_ORDER]);
                case PENDING_ORDER_IDS[1]:
                    return Promise.resolve([TEST_PARTIAL_EXECUTION_ORDER]);
                default:
                    return Promise.resolve([]);
            }
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrder.findAll
            );

            const [failed_order, marked_order] = orders;

            chai.assert.isDefined(failed_order);
            chai.assert.isDefined(marked_order);

            chai.expect(failed_order.status).to.eq(RECIPE_ORDER_STATUSES.Failed, `Status was not Failed for failed order ${failed_order.id}`);
            chai.expect(marked_order.status).to.eq(RECIPE_ORDER_STATUSES.Executing, `Status was not Executing for partial order ${marked_order.id}`);
        });
    });

    it("shall finish a pending order if fulfilled execution orders cover its initial quantity", () => {

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            let pending_order2 = Object.assign({}, TEST_SYMBOL_PENDING_ORDER_BASE, {
                id: PENDING_ORDER_IDS[1]
            });
            stubSave(pending_order2);
            return Promise.resolve([pending_order2]);
        });
        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {
            const fills_num = _.random(1, 9, false);
            return Promise.resolve(_.map(Array(fills_num).fill(PENDING_ORDER_QNTY / (fills_num - 1)), (qnty, idx) => {
                return Object.assign({}, TEST_FILLED_EXECUTION_ORDER, {
                    id: TEST_FILLED_EXECUTION_ORDER.id + (idx * 7),
                    total_quantity: qnty
                });
            }))
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrder.findAll
            );

            chai.expect(orders.length).to.eq(1);
            const [finished_order] = orders;

            chai.expect(finished_order.status).to.eq(RECIPE_ORDER_STATUSES.Completed);
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
        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {

            switch (options.where.recipe_order_id) {
                case PENDING_ORDER_IDS[0]:
                    //half-fill the normal order
                    const fills_num = _.random(1, 9, false);
                    const half_qnty = (PENDING_ORDER_QNTY / 2);

                    //check that cancelled order be ignored
                    const cancelled_order = Object.assign({}, TEST_CANCELLED_EXECUTION_ORDER, {
                        total_quantity: half_qnty
                    });
                    return Promise.resolve(
                        _.concat(
                            _.map(Array(fills_num).fill(half_qnty / fills_num), (qnty, idx) => {
                                return Object.assign({}, TEST_FILLED_EXECUTION_ORDER, {
                                    id: TEST_FILLED_EXECUTION_ORDER.id + (idx * 7),
                                    total_quantity: qnty
                                });
                            }),
                            cancelled_order
                        )
                    );
                default:
                    return Promise.resolve([]);
            }
        });
        sinon.stub(ExecutionOrder, 'create').callsFake(options => {

            return Promise.resolve(options);
        });

        return execOrderGenerator.JOB_BODY(stubbed_config, console.log).then(orders_and_execution_orders => {

            restoreSymbols(
                RecipeOrder.findAll,
                ExecutionOrder.findAll,
                ExecutionOrder.create
            );

            const [parent_and_line_order, parent_and_whole_order] = orders_and_execution_orders;

            const [parent_line, line_order] = parent_and_line_order;
            const [parent_whole, whole_order] = parent_and_whole_order;

            chai.assert.isDefined(line_order);
            chai.assert.isDefined(whole_order);

            //returned execution orders with correct initial status
            chai.expect(line_order.status).to.eq(EXECUTION_ORDER_STATUSES.Pending);
            chai.expect(whole_order.status).to.eq(EXECUTION_ORDER_STATUSES.Pending);

            //parent orders expected ot become executing
            chai.expect(parent_line.status).to.eq(RECIPE_ORDER_STATUSES.Executing);
            chai.expect(parent_whole.status).to.eq(RECIPE_ORDER_STATUSES.Executing);

            const execution_orders = [line_order, whole_order];

            //common data was written in correctly
            _.forEach(execution_orders, (order, idx) => {
                chai.expect(order.instrument_id).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.instrument_id);
                chai.expect(order.exchange_id).to.eq(TEST_SYMBOL_PENDING_ORDER_BASE.target_exchange_id);
                chai.expect(order.type).to.eq(EXECUTION_ORDER_TYPES.Market);
                chai.expect(order.recipe_order_id).to.eq(PENDING_ORDER_IDS[idx]);
            });

            //correct quantity was used for line order even though theres more quantity left
            chai.assert.closeTo(line_order.total_quantity, SYSTEM_SETTINGS.BASE_BTC_TRADE, SYSTEM_SETTINGS.TRADE_BASE_FUZYNESS);
            //quantity in order was capped to total available
            chai.assert.isAtMost(whole_order.total_quantity, low_total_qnty);
        });
    });

});