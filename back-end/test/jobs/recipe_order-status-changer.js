'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");

chai.use(chaiAsPromised);

const recipeOrderStatusChanger = require('../../jobs/recipe-order-status-changer');
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


describe('Recipe Order status changer job', () => {


    const config = {
        models: {
            sequelize
        }
    };

    before(done => {
        app.dbPromise.then(migrations => {
            console.log('Migrations: %o', migrations);



            done();
        });
    });

    beforeEach(done => {

        done();
    });

    afterEach(done => {

        restoreSymbols(
            sequelize.query
        );

        done();
    });


    it("job body shall exist", () => {
        chai.expect(recipeOrderStatusChanger.JOB_BODY).to.exist;
    });

    it("shall do nothing if all orders are in terminal state", () => {


        const query_stub = sinon.stub(sequelize, 'query').callsFake(query => {
            return Promise.resolve([])
        });

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('string');
            chai.assert(query_stub.calledTwice, 'query was supposed to be called twice!');
            chai.expect(results).to.eq('Nothing to change!');
        })
    });

    it("shall fail recipe orders with all failed execution orders", () => {

        let call_counter = 0;
        const exec_stats = [
            {
                id: 1,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 1, 
                failed_execution: 1,
                current_execution: 0
            },
            {
                id: 2,
                status: RECIPE_ORDER_STATUSES.Executing, 
                all_execution: 4, 
                failed_execution: 4,
                current_execution: 0
            },
            {
                id: 3,
                status: RECIPE_ORDER_STATUSES.Failed, 
                all_execution: 5, 
                failed_execution: 5,
                current_execution: 0
            }
        ];
        const query_stub = sinon.stub(sequelize, 'query').callsFake(query => {
            //first query
            if (call_counter == 0) {
                call_counter++;
                //fail-ready recipe orders
                return Promise.resolve(exec_stats)
            } else if (call_counter == 1) {
                call_counter++;
                //no fills
                return Promise.resolve([])
            } else if (call_counter == 2) {

                return Promise.resolve(query);
            }
        });

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('string');
            chai.assert(query_stub.calledThrice, 'query was supposed to be called 3 times with save!');
            _.forEach([0, 1], idx => {
                chai.assert(results.includes(`(${exec_stats[idx].id}, ${RECIPE_ORDER_STATUSES.Failed})`), `Recipe order ${exec_stats[idx].id} should be updated to ${RECIPE_ORDER_STATUSES.Failed}`)
            })
            chai.assert(!results.includes(`(${exec_stats[2].id}, ${RECIPE_ORDER_STATUSES.Failed})`), `Recipe order ${exec_stats[2].id} should not be updated!`);
        })
    });

    it("shall set recipe order to executing if it has active fills and not completely filled", () => {

        let call_counter = 0;
        const exec_stats = [
            {
                id: 1,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 1, 
                failed_execution: 0,
                current_execution: 1
            },
            {
                id: 2,
                status: RECIPE_ORDER_STATUSES.Executing, 
                all_execution: 4, 
                failed_execution: 1,
                current_execution: 3
            },
            {
                id: 3,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 5, 
                failed_execution: 2,
                current_execution: 3
            }
        ];
        const query_stub = sinon.stub(sequelize, 'query').callsFake(query => {
            //first query
            if (call_counter == 0) {
                call_counter++;
                //fail-ready recipe orders
                return Promise.resolve(exec_stats)
            } else if (call_counter == 1) {
                call_counter++;
                //no fills
                return Promise.resolve([])
            } else if (call_counter == 2) {

                return Promise.resolve(query);
            }
        });

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('string');
            chai.assert(query_stub.calledThrice, 'query was supposed to be called 3 times with save!');
            _.forEach([0, 2], idx => {
                chai.assert(results.includes(`(${exec_stats[idx].id}, ${RECIPE_ORDER_STATUSES.Executing})`), `Recipe order ${exec_stats[idx].id} should be updated to ${RECIPE_ORDER_STATUSES.Executing}`)
            })
            chai.assert(!results.includes(`(${exec_stats[1].id}, ${RECIPE_ORDER_STATUSES.Executing})`), `Recipe order ${exec_stats[1].id} should not be updated!`);
        })
    });

    it("shall set recipe order to complete when fills are enough to complete it", () => {

        let call_counter = 0;
        const exec_stats = [
            {
                id: 1,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 1, 
                failed_execution: 0,
                current_execution: 1
            },
            {
                id: 2,
                status: RECIPE_ORDER_STATUSES.Executing, 
                all_execution: 4, 
                failed_execution: 1,
                current_execution: 3
            },
            {
                id: 3,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 5, 
                failed_execution: 2,
                current_execution: 3
            }
        ];
        const query_stub = sinon.stub(sequelize, 'query').callsFake(query => {
            //first query
            if (call_counter == 0) {
                call_counter++;
                //fail-ready recipe orders
                return Promise.resolve(exec_stats)
            } else if (call_counter == 1) {
                call_counter++;
                //no fills
                return Promise.resolve([
                    {
                        id: 3,
                        status: RECIPE_ORDER_STATUSES.Pending, 
                        quantity: 5, 
                        spend_amount: 0.2,
                        fills_quantity: 5,
                        sold_quantity: 0.2
                    }
                ])
            } else if (call_counter == 2) {

                return Promise.resolve(query);
            }
        });

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('string');
            chai.assert(query_stub.calledThrice, 'query was supposed to be called 3 times with save!');
            
            chai.assert(results.includes(`(${exec_stats[0].id}, ${RECIPE_ORDER_STATUSES.Executing})`), `Recipe order ${exec_stats[0].id} should be updated to ${RECIPE_ORDER_STATUSES.Executing}`)
            chai.assert(!results.includes(`(${exec_stats[1].id}, ${RECIPE_ORDER_STATUSES.Executing})`), `Recipe order ${exec_stats[1].id} should not be updated!`);
            chai.assert(results.includes(`(${exec_stats[2].id}, ${RECIPE_ORDER_STATUSES.Completed})`), `Recipe order ${exec_stats[2].id} should be updated to ${RECIPE_ORDER_STATUSES.Completed}`)
        })
    });

    it("shall set recipe order to complete if property stop_gen is set to true", () => {


        let call_counter = 0;
        const exec_stats = [
            {
                id: 1,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 1, 
                failed_execution: 0,
                current_execution: 1
            },
            {
                id: 2,
                status: RECIPE_ORDER_STATUSES.Executing, 
                all_execution: 4, 
                failed_execution: 1,
                current_execution: 3
            },
            {
                id: 3,
                status: RECIPE_ORDER_STATUSES.Pending, 
                all_execution: 5, 
                failed_execution: 2,
                current_execution: 3
            }
        ];
        const query_stub = sinon.stub(sequelize, 'query').callsFake(query => {
            //first query
            if (call_counter == 0) {
                call_counter++;
                //fail-ready recipe orders
                return Promise.resolve(exec_stats)
            } else if (call_counter == 1) {
                call_counter++;
                //no fills
                return Promise.resolve([
                    {
                        id: 3,
                        status: RECIPE_ORDER_STATUSES.Pending, 
                        quantity: 5, 
                        spend_amount: 0.2,
                        fills_quantity: 4.875,
                        sold_quantity: 0.195,
                        stop_gen: true
                    }
                ])
            } else if (call_counter == 2) {

                return Promise.resolve(query);
            }
        });

        return recipeOrderStatusChanger.JOB_BODY(config, console.log).then(results => {

            chai.expect(results).is.a('string');
            chai.assert(query_stub.calledThrice, 'query was supposed to be called 3 times with save!');
            
            chai.assert(results.includes(`(${exec_stats[0].id}, ${RECIPE_ORDER_STATUSES.Executing})`), `Recipe order ${exec_stats[0].id} should be updated to ${RECIPE_ORDER_STATUSES.Executing}`)
            chai.assert(!results.includes(`(${exec_stats[1].id}, ${RECIPE_ORDER_STATUSES.Executing})`), `Recipe order ${exec_stats[1].id} should not be updated!`);
            chai.assert(results.includes(`(${exec_stats[2].id}, ${RECIPE_ORDER_STATUSES.Completed})`), `Recipe order ${exec_stats[2].id} should be updated to ${RECIPE_ORDER_STATUSES.Completed}`)
        })
    });
});