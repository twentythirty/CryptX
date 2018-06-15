'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ordersService = require('../../services/OrdersService');
const RecipeRun = require('../../models').RecipeRun;
const RecipeRunDetail = require('../../models').RecipeRunDetail;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;
const RecipeOrder = require('../../models').RecipeOrder;
const Instrument = require('../../models').Instrument;
const Asset = require('../../models').Asset;
const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
const InstrumentMarketData = require('../../models').InstrumentMarketData;
const CCXTUtils = require('../../utils/CCXTUtils');




describe('OrdersService testing', () => {

    const TEST_RECIPE_RUN = {

        id: 435,
        investment_run_id: 37,
        approval_user_id: 11,
        approval_status: RECIPE_RUN_STATUSES.Approved
    };
    const QUOTE_ASSET_ID = 801;
    const TEST_INSTRUMENTS = [{
            id: 900,
            symbol: 'TST1/TST2',
            transaction_asset_id: 800,
            quote_asset_id: QUOTE_ASSET_ID
        },
        {
            id: 901,
            symbol: 'TST3/TST2',
            transaction_asset_id: 802,
            quote_asset_id: QUOTE_ASSET_ID
        }
    ];
    const TEST_EXCHANGE_IDS = [34, 57, 89, 99, 7, 33];
    const TEST_ASSET_IDS = _.uniq(_.flatMap(TEST_INSTRUMENTS, instrument => [instrument.transaction_asset_id, instrument.quote_asset_id]));
    const TEST_ASSETS = _.uniq(_.flatMap(TEST_INSTRUMENTS, instrument => {
        const symbol_parts = instrument.symbol.split('/');
        return [{
                id: instrument.transaction_asset_id,
                symbol: symbol_parts[0]
            },
            {
                id: instrument.quote_asset_id,
                symbol: symbol_parts[1]
            }
        ]
    }), 'id');
    const TEST_RECIPE_RUN_DETAILS = _.map(TEST_EXCHANGE_IDS, exchange_id => {
        const assets_no_quote = _.filter(TEST_ASSET_IDS, id => id !== QUOTE_ASSET_ID);
        const assets_pair = [QUOTE_ASSET_ID, assets_no_quote[_.random(assets_no_quote.length - 1)]];
        const transaction_asset_id = assets_pair[_.random(1, false)];
        const quote_asset_id = _.filter(assets_pair, id => id !== transaction_asset_id)[0];
        return {
            id: exchange_id + _.random(45, 777, false),
            //between 10 and 20%
            investment_percentage: _.random(10.0, 20.0, true),
            recipe_run_id: TEST_RECIPE_RUN.id,
            target_exchange_id: exchange_id,
            transaction_asset_id: transaction_asset_id,
            quote_asset_id: quote_asset_id
        }
    });
    const TEST_EXCHNAGE_MAPPINGS = _.flatMap(_.map(TEST_EXCHANGE_IDS, exchange_id => {
        return _.map(TEST_INSTRUMENTS, instrument => {

            return {
                tisk_size: 0.00001,
                exchnage_id: exchange_id,
                instrument_id: instrument.id,
                external_instrument_id: `TST${instrument.transaction_asset_id - 800 + 1}/TST${instrument.quote_asset_id - 800 +1}`
            }
        })
    }));
    const TEST_INSTRUMENT_MARKET_DATA = _.flatMap(_.map(TEST_EXCHANGE_IDS, exchange_id => {
        return _.map(TEST_INSTRUMENTS, instrument => {

            return {
                instrument_id: instrument.id,
                exchange_id: exchange_id,
                timestamp: new Date(),
                bid_price: Math.random(),
                ask_price: Math.random()
            }
        })
    }));

    it("the service shall exist", function () {
        chai.expect(ordersService).to.exist;
    });

    describe("and the method generateApproveRecipeOrders shall", () => {

        //ensure working DB before test
        before(done => {

            app.dbPromise.then(migrations => {
                console.log("Migraitions: %o", migrations);

                sinon.stub(RecipeRun, 'findById').callsFake(run_id => {

                    return Promise.resolve(TEST_RECIPE_RUN);
                });
                sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {

                    return Promise.resolve(TEST_RECIPE_RUN_DETAILS);
                });
                sinon.stub(Instrument, 'findAll').callsFake(options => {

                    return Promise.resolve(TEST_INSTRUMENTS);
                });
                sinon.stub(Asset, 'findAll').callsFake(options => {

                    return Promise.resolve(TEST_ASSETS);
                });
                sinon.stub(InstrumentExchangeMapping, 'findAll').callsFake(options => {

                    return Promise.resolve(TEST_EXCHNAGE_MAPPINGS);
                });
                sinon.stub(InstrumentMarketData, 'findAll').callsFake(options => {

                    return Promise.resolve(TEST_INSTRUMENT_MARKET_DATA);
                });
                sinon.stub(RecipeOrderGroup, 'create').callsFake(options => {

                    return Promise.resolve(new RecipeOrderGroup(options));
                });
                sinon.stub(RecipeOrder, 'create').callsFake(options => {

                    return Promise.resolve(new RecipeOrder(options));
                });
                sinon.stub(CCXTUtils, 'getConnector').callsFake(data => {

                    return Promise.resolve({
                        fetchBalance: async () => {

                            return {
                                free: _.zipObject(
                                    _.map(TEST_ASSETS, 'symbol'),
                                    Array(TEST_ASSETS.length).fill().map(ignore => _.random(0.1, 500, true))
                                )
                            }
                        }
                    });
                });

                done();
            });
        });

        after(done => {
            [
                RecipeRun.findById,
                RecipeRunDetail.findAll,
                Instrument.findAll,
                Asset.findAll,
                InstrumentExchangeMapping.findAll,
                InstrumentMarketData.findAll,
                RecipeOrderGroup.create,
                RecipeOrder.create,
                CCXTUtils.getConnector
            ].forEach(model => {

                if (model.restore) {
                    model.restore();
                }
            });

            done();
        })

        it("exist", function () {
            chai.expect(ordersService.generateApproveRecipeOrders).to.exist;
        });

        it("shall reject generating a second set of orders when a group exists", (done) => {

            sinon.stub(RecipeOrderGroup, 'findOne').callsFake(options => {

                return Promise.resolve({
                    id: 9880
                })
            });

            ordersService.generateApproveRecipeOrders(TEST_RECIPE_RUN.id).then(
                fullfillment => {

                    RecipeOrderGroup.findOne.restore();
                    throw new Error("should have been rejected!");
                }, rejection => {

                    RecipeOrderGroup.findOne.restore();
                    done();
                });
        });

        it("shall reject generating a set of orders when no good recipes were made", (done) => {

            //ensure method call not rejected due to existing RecipeOrderGroup
            sinon.stub(RecipeOrderGroup, 'findOne').callsFake(options => {

                return Promise.resolve(null);
            });
            //make all deposits of bad currency to reject all mappings
            CCXTUtils.getConnector.restore();
            sinon.stub(CCXTUtils, 'getConnector').callsFake(exchange => {

                return Promise.resolve({
                    fetchBalance: async () => {
                        return {
                            free: {}
                        }
                    }
                })
            });

            ordersService.generateApproveRecipeOrders(TEST_RECIPE_RUN.id).then(fulfilled => {

                CCXTUtils.getConnector.restore();
                sinon.stub(CCXTUtils, 'getConnector').callsFake(data => {

                    return Promise.resolve({
                        fetchBalance: async () => {

                            return {
                                free: _.zipObject(
                                    _.map(TEST_ASSETS, 'symbol'),
                                    Array(TEST_ASSETS.length).fill().map(ignore => _.random(0.1, 500, true))
                                )
                            }
                        }
                    });
                });
                RecipeOrderGroup.findOne.restore();
                throw new Error("Orders service should have rejected empty valid orders!");
            }, rejected => {

                CCXTUtils.getConnector.restore();
                sinon.stub(CCXTUtils, 'getConnector').callsFake(data => {

                    return Promise.resolve({
                        fetchBalance: async () => {

                            return {
                                free: _.zipObject(
                                    _.map(TEST_ASSETS, 'symbol'),
                                    Array(TEST_ASSETS.length).fill().map(ignore => _.random(0.1, 500, true))
                                )
                            }
                        }
                    });
                });
                RecipeOrderGroup.findOne.restore();
                done();
            });
        });

        it('shall generate a list of recipe orders if all is good', (done) => {
            //ensure method call not rejected due to existing RecipeOrderGroup
            sinon.stub(RecipeOrderGroup, 'findOne').callsFake(options => {

                return Promise.resolve(null);
            });

            ordersService.generateApproveRecipeOrders(TEST_RECIPE_RUN.id).then(response => {

                chai.expect(response).is.a('array', "orders need to be returned as an array!");
                response.forEach(recipe_order => {

                    chai.expect(recipe_order.status).to.eq(RECIPE_ORDER_STATUSES.Pending, "Order was not created with the correct status!");
                    chai.expect(recipe_order.side).to.be.oneOf(Object.values(ORDER_SIDES), "Order side is an invalid value!");
                    chai.expect(recipe_order.quantity).to.be.greaterThan(0.0, "Order is not of tangible quantity!");
                });

                RecipeOrderGroup.findOne.restore();
                done();
            }, rejected => {

                RecipeOrderGroup.findOne.restore();
                throw rejected;
            })
        });
    });

    describe("and the method changeRecipeOrderGroupStatus shall", () => {

        const TEST_USER_ID = 76;
        const TEST_ORDER_GROUP_ID = 2234;
        const APPROVE_COMMENT = 'This order group is a good order group.';
        const REJECT_COMMENT = 'This order group is not up to task';
        const INITIAL_STATUS = RECIPE_ORDER_GROUP_STATUSES.Pending;

        const TEST_RECIPE_ORDER_GROUP = {

            id: TEST_ORDER_GROUP_ID,
            created_timestamp: new Date(),
            approval_user_id: null,
            approval_status: INITIAL_STATUS,
            approval_timestamp: null,
            approval_comment: ''
        }

        it("exist", function () {
            chai.expect(ordersService.changeRecipeOrderGroupStatus).to.exist;
        });

        it("shall reject altering order group status when the params aren't right", () => {

            return Promise.all([
                ordersService.changeRecipeOrderGroupStatus(null, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, APPROVE_COMMENT).should.eventually.be.rejected,
                ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, null, RECIPE_ORDER_GROUP_STATUSES.Rejected, REJECT_COMMENT).should.eventually.be.rejected,
                ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, null).should.eventually.be.rejected,
                ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Rejected * 5, REJECT_COMMENT).should.eventually.be.rejected
            ]);
        });

        it("shall NOT alter recipe order group when status is the same", () => {

            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {

                return Promise.resolve(TEST_RECIPE_ORDER_GROUP);
            });

            return ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, INITIAL_STATUS, APPROVE_COMMENT).then(order_group => {
                RecipeOrderGroup.findById.restore();
                return chai.assert.deepEqual(order_group, TEST_RECIPE_ORDER_GROUP, 'order group was altered in the test!');
            });
        });

        it("shall approve recipe order group when approval is required", () => {

            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {
                let new_group = Object.assign({}, TEST_RECIPE_ORDER_GROUP);
                new_group.save = () => {
                    return Promise.resolve(new_group);
                };
                return Promise.resolve(new_group);
            });

            return ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, APPROVE_COMMENT).then(recipe_order => {

                RecipeOrderGroup.findById.restore();
                chai.assert.isNotNull(recipe_order, 'Should have returned recipe order!');
                chai.assert.equal(recipe_order.approval_status, RECIPE_ORDER_GROUP_STATUSES.Approved, 'Status was not Approved!');
                chai.assert.equal(recipe_order.approval_user_id, TEST_USER_ID, 'Approval not provided by specified user!');
                chai.assert.equal(recipe_order.approval_comment, APPROVE_COMMENT, 'approval comment not as specified!');
            });
        });

        it("shall set status of all orders in group as rejected also when rejected", () => {

            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {
                let new_group = Object.assign({}, TEST_RECIPE_ORDER_GROUP);
                new_group.save = () => {
                    return Promise.resolve(new_group);
                };
                new_group.getRecipeOrders = () => {
                    const orders = Array(5).fill(0).map(num => {
                        let order = {
                            status: RECIPE_ORDER_STATUSES.Pending
                        };
                        order.save = () => {
                            return Promise.resolve(order);
                        };
                        return order;
                    })
                    return Promise.resolve(orders);
                };
                return Promise.resolve(new_group);
            });

            return ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Rejected, REJECT_COMMENT).then(recipe_data => {

                RecipeOrderGroup.findById.restore();
                chai.assert.isNotNull(recipe_data, 'Should have returned recipe order group and orders in it!');
                chai.expect(recipe_data).is.a('array');
                let [recipe_order, orders] = recipe_data;
                chai.assert.isNotNull(recipe_order, 'Should have returned recipe order!');
                chai.expect(orders).is.a('array');
                chai.assert.equal(recipe_order.approval_status, RECIPE_ORDER_GROUP_STATUSES.Rejected, 'Status was not Rejected!');
                chai.assert.equal(recipe_order.approval_user_id, TEST_USER_ID, 'Approval not provided by specified user!');
                chai.assert.equal(recipe_order.approval_comment, REJECT_COMMENT, 'approval comment not as specified!');

                orders.map(order => {
                    chai.assert.equal(order.status, RECIPE_ORDER_STATUSES.Rejected, `order ${order} was not rejected with group!`);
                });
            });
        });
    });
});