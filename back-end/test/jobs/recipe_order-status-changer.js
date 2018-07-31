'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const recipeOrderStatusChanger = require('../../jobs/recipe-order-status-changer');

const RecipeOrder = require('../../models').RecipeOrder;
const ExecutionOrder = require('../../models').ExecutionOrder;
const ExecutionOrderFill = require('../../models').ExecutionOrderFill;
const Op = require('../../models').Sequelize.Op;

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


describe('Recipe Order status changer job', () => {


    const config = {
        models: {
            RecipeOrder,
            ExecutionOrder,
            ExecutionOrderFill,
            Sequelize: {
                Op
            }
        }
    };

    const FAIL_EXEC_ORD_ID = 455;
    const ACTIVE_EXEC_ORD_ID = 900;
    const COMPLETE_FILLS_ORD_ID = 78441;
    const COMPLETE_ORD_QNTY = 40;
    const FAILED_ORDER_IDS = [
        10, 20, 30, 40
    ];

    const ORDERS_DB = [{
            id: FAILED_ORDER_IDS[0],
            status: RECIPE_ORDER_STATUSES.Completed
        },
        {
            id: FAILED_ORDER_IDS[1],
            status: RECIPE_ORDER_STATUSES.Failed
        },
        {
            id: FAILED_ORDER_IDS[2],
            status: RECIPE_ORDER_STATUSES.Cancelled
        },
        {
            id: FAILED_ORDER_IDS[3],
            status: RECIPE_ORDER_STATUSES.Rejected
        },
        {
            id: FAIL_EXEC_ORD_ID,
            status: RECIPE_ORDER_STATUSES.Executing
        },
        {
            id: ACTIVE_EXEC_ORD_ID,
            status: RECIPE_ORDER_STATUSES.Pending,
            quantity: 78.0
        },
        {
            id: COMPLETE_FILLS_ORD_ID,
            status: RECIPE_ORDER_STATUSES.Executing,
            quantity: COMPLETE_ORD_QNTY
        }
    ];


    const FILLED_EXEC_ORD_ID = 8888;
    const EXECUTION_ORDERS_DB = [{
            id: 4009,
            recipe_order_id: FAIL_EXEC_ORD_ID,
            status: EXECUTION_ORDER_STATUSES.Failed
        },
        {
            id: 4010,
            recipe_order_id: FAIL_EXEC_ORD_ID,
            status: EXECUTION_ORDER_STATUSES.Failed
        },
        {
            id: 4011,
            recipe_order_id: FAIL_EXEC_ORD_ID,
            status: EXECUTION_ORDER_STATUSES.Failed
        },
        {
            id: 4012,
            recipe_order_id: ACTIVE_EXEC_ORD_ID,
            status: EXECUTION_ORDER_STATUSES.PartiallyFilled
        },
        {
            id: FILLED_EXEC_ORD_ID,
            recipe_order_id: COMPLETE_FILLS_ORD_ID,
            status: EXECUTION_ORDER_STATUSES.FullyFilled
        }
    ];

    const EXECUTION_ORDER_FILLS_DB = [
        {
            id: 100,
            execution_order_id: FILLED_EXEC_ORD_ID,
            quantity: COMPLETE_ORD_QNTY / 2
        },
        {
            id: 101,
            execution_order_id: FILLED_EXEC_ORD_ID,
            quantity: COMPLETE_ORD_QNTY / 2
        },
    ];

    before(done => {
        app.dbPromise.then(migrations => {
            console.log('Migrations: %o', migrations);



            done();
        });
    });

    beforeEach(done => {

        //fresh DB fr every test
        const TEST_ORDERS_DB = _.cloneDeep(ORDERS_DB);
        const TEST_EXECUTION_ORDERS_DB = _.cloneDeep(EXECUTION_ORDERS_DB);
        const TEST_EXEC_ORDER_FILL_DB = _.cloneDeep(EXECUTION_ORDER_FILLS_DB);

        stubSave(...TEST_ORDERS_DB);

        sinon.stub(RecipeOrder, 'findAll').callsFake(options => {

            return Promise.resolve(_.filter(TEST_ORDERS_DB,
                order => !options.where.status[Op.notIn].includes(order.status)));
        });

        sinon.stub(ExecutionOrder, 'findAll').callsFake(options => {

            return Promise.resolve(_.filter(TEST_EXECUTION_ORDERS_DB,
                exec_order => options.where.recipe_order_id === exec_order.recipe_order_id));
        });

        sinon.stub(ExecutionOrderFill, 'findAll').callsFake(options => {

            return Promise.resolve(_.filter(TEST_EXEC_ORDER_FILL_DB,
                exec_order_fill => options.where.execution_order_id.includes(exec_order_fill.execution_order_id)))
        });

        done();
    });

    afterEach(done => {

        restoreSymbols(
            RecipeOrder.findAll,
            ExecutionOrder.findAll,
            ExecutionOrderFill.findAll
        );

        done();
    });


    it("job body shall exist", () => {
        chai.expect(recipeOrderStatusChanger.JOB_BODY).to.exist;
    });

    it("shall do nothing if all orders are in terminal state", () => {

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('array');

            const failed_ord_results = _.filter(results, res => FAILED_ORDER_IDS.includes(res.id))

            chai.expect(failed_ord_results).to.be.empty;
        })
    });

    it("shall fail recipe orders with all failed execution orders", () => {

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('array');
            chai.expect(results).to.not.be.empty;

            const failed_order = _.find(results, res => res.id === FAIL_EXEC_ORD_ID);

            chai.expect(failed_order).to.not.be.null;
            chai.expect(failed_order.status).to.not.be.undefined;
            chai.expect(failed_order.status).to.eq(RECIPE_ORDER_STATUSES.Failed);
        })
    });

    it("shall set recipe order to executing if it was pending and has active fills and not compeltely filled", () => {

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('array');
            chai.expect(results).to.not.be.empty;

            const executing_order = _.find(results, res => res.id === ACTIVE_EXEC_ORD_ID);

            chai.expect(executing_order).to.not.be.null;
            chai.expect(executing_order.status).to.not.be.undefined;
            chai.expect(executing_order.status).to.eq(RECIPE_ORDER_STATUSES.Executing);
        })
    });

    it("shall set recipe order to complete when fills are enough to complete it", () => {

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('array');
            chai.expect(results).to.not.be.empty;

            const complete_order = _.find(results, res => res.id === COMPLETE_FILLS_ORD_ID);

            chai.expect(complete_order).to.not.be.null;
            chai.expect(complete_order.status).to.not.be.undefined;
            chai.expect(complete_order.status).to.eq(RECIPE_ORDER_STATUSES.Completed);
        })
    });
});