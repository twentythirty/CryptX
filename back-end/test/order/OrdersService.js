'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ordersService = require('../../services/OrdersService');
const RecipeRun = require('../../models').RecipeRun;
const RecipeRunDeposit = require('../../models').RecipeRunDeposit;
const RecipeRunDetail = require('../../models').RecipeRunDetail;
const ExchangeAccount = require('../../models').ExchangeAccount;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;
const RecipeOrder = require('../../models').RecipeOrder;
const ExecutionOrder = require('../../models').ExecutionOrder;
const Instrument = require('../../models').Instrument;
const Asset = require('../../models').Asset;
const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
const InstrumentMarketData = require('../../models').InstrumentMarketData;
const ccxtUtils = require('../../utils/CCXTUtils');
const Op = require('../../models').Sequelize.Op;



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
            reverse_symbol: () => {
                return 'TST2/TST1'
            },
            transaction_asset_id: 800,
            quote_asset_id: QUOTE_ASSET_ID
        },
        {
            id: 901,
            symbol: 'TST3/TST2',
            reverse_symbol: () => {
                return 'TST2/TST3'
            },
            transaction_asset_id: 802,
            quote_asset_id: QUOTE_ASSET_ID
        }
    ];
    const TEST_EXCHANGE_IDS = [34, 57, 89, 99, 7, 33];
    const TEST_ASSET_IDS = _.uniq(_.flatMap(TEST_INSTRUMENTS, instrument => [instrument.transaction_asset_id, instrument.quote_asset_id]));
    const TEST_EXCHANGE_ACCOUNT_IDS = [45, 1421, 32532, 351, 123412, 1341];
    const TEST_EXCHANGE_ACCOUNTS = _.map(TEST_EXCHANGE_ACCOUNT_IDS, (account_id, idx) => {
        return {
            id: account_id,
            exchange_id: TEST_EXCHANGE_IDS[idx],
            asset_id: TEST_ASSET_IDS[_.random(0, TEST_ASSET_IDS.length, false)]
        }
    });
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
                tick_size: 0.00001,
                exchange_id: exchange_id,
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

    const TEST_EXECUTION_ORDER = {
        id: 1,
        status: EXECUTION_ORDER_STATUSES.Pending,
        save: function() {
            return Promise.resolve(this);
        },
        toJSON: function() {
            let json = _.clone(this);
            delete json.save;
            delete json.toJSON;
            return json;
        }
    }

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
                sinon.stub(ccxtUtils, 'getConnector').callsFake(data => {

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
                sinon.stub(ccxtUtils, 'allConnectors').callsFake(data => {

                    const markets = _.fromPairs(_.map(TEST_ASSETS, asset => {

                        return [
                            asset.symbol,
                            {
                                limits: {
                                    amount: {
                                        min: 0
                                    }
                                }
                            }
                        ]
                    }));

                    return Promise.resolve(_.zipObject(
                        TEST_EXCHANGE_IDS, 
                        _.times(TEST_EXCHANGE_IDS.length, _.constant({ 
                            markets
                         }))
                    ))
                });
                sinon.stub(RecipeRunDeposit, 'findAll').callsFake(options => {

                    return Promise.resolve(
                        _.flatMap(_.map(TEST_ASSET_IDS, asset_id => {
                            return _.map(TEST_EXCHANGE_ACCOUNT_IDS, exchange_account_id => {
                                return new RecipeRunDeposit({
                                    target_exchange_account_id: exchange_account_id,
                                    asset_id: asset_id,
                                    recipe_run_id: TEST_RECIPE_RUN.id,
                                    amount: _.random(0, 500, true),
                                    status: RECIPE_RUN_DEPOSIT_STATUSES.Completed
                                })
                            })
                        }))
                    )
                });
                sinon.stub(ExchangeAccount, 'findAll').callsFake(options => {
                    return Promise.resolve(TEST_EXCHANGE_ACCOUNTS);
                });

                done();
            });
        });

        after(done => {
            [
                RecipeRun.findById,
                RecipeRunDetail.findAll,
                RecipeRunDeposit.findAll,
                Instrument.findAll,
                Asset.findAll,
                InstrumentExchangeMapping.findAll,
                InstrumentMarketData.findAll,
                RecipeOrderGroup.create,
                RecipeOrder.create,
                RecipeOrder.findAll,
                ccxtUtils.getConnector,
                ccxtUtils.allConnectors
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
            RecipeRunDeposit.findAll.restore();
            sinon.stub(RecipeRunDeposit, 'findAll').callsFake(options => {
                return Promise.resolve([])
            });

            ordersService.generateApproveRecipeOrders(TEST_RECIPE_RUN.id).then(fulfilled => {

                RecipeRunDeposit.findAll.restore();
                sinon.stub(RecipeRunDeposit, 'findAll').callsFake(options => {

                    return Promise.resolve(
                        _.flatMap(_.map(TEST_ASSET_IDS, asset_id => {
                            return _.map(TEST_EXCHANGE_ACCOUNT_IDS, exchange_account_id => {
                                return new RecipeRunDeposit({
                                    target_exchange_account_id: exchange_account_id,
                                    asset_id: asset_id,
                                    recipe_run_id: TEST_RECIPE_RUN.id,
                                    amount: _.random(0, 500, true)
                                })
                            })
                        }))
                    )
                });
                RecipeOrderGroup.findOne.restore();
                throw new Error("Orders service should have rejected empty valid orders!");
            }, rejected => {

                RecipeRunDeposit.findAll.restore();
                sinon.stub(RecipeRunDeposit, 'findAll').callsFake(options => {

                    return Promise.resolve(
                        _.flatMap(_.map(TEST_ASSET_IDS, asset_id => {
                            return _.map(TEST_EXCHANGE_ACCOUNT_IDS, exchange_account_id => {
                                return new RecipeRunDeposit({
                                    target_exchange_account_id: exchange_account_id,
                                    asset_id: asset_id,
                                    recipe_run_id: TEST_RECIPE_RUN.id,
                                    amount: _.random(0, 500, true)
                                })
                            })
                        }))
                    )
                });
                RecipeOrderGroup.findOne.restore();
                done();
            });
        });

        it ('shall reject generating a list of recipes if there are incomplete despoits', () => {
            //ensure method call not rejected due to existing RecipeOrderGroup
            sinon.stub(RecipeOrderGroup, 'findOne').callsFake(options => {

                return Promise.resolve(null);
            });
            chai.expect(ordersService.generateApproveRecipeOrders(TEST_RECIPE_RUN.id)).isRejected;
        });

        it('shall generate a list of recipe orders if all is good', (done) => {
            if(RecipeOrderGroup.findOne.restore) {
                RecipeOrderGroup.findOne.restore();
            }
            //ensure method call not rejected due to existing RecipeOrderGroup
            sinon.stub(RecipeOrderGroup, 'findOne').callsFake(options => {

                return Promise.resolve(null);
            });

            //replace recipe deposit stub to ensure no failed deposits when generating orders
            RecipeRunDeposit.findAll.restore();
            sinon.stub(RecipeRunDeposit, 'findAll').callsFake(options => {

                if (_.isPlainObject(options.where.status)) {
                    return Promise.resolve([])
                }

                return Promise.resolve(
                    _.flatMap(_.map(TEST_ASSET_IDS, asset_id => {
                        return _.map(TEST_EXCHANGE_ACCOUNT_IDS, exchange_account_id => {
                            return new RecipeRunDeposit({
                                target_exchange_account_id: exchange_account_id,
                                asset_id: asset_id,
                                recipe_run_id: TEST_RECIPE_RUN.id,
                                amount: _.random(0, 500, true),
                                status: RECIPE_RUN_DEPOSIT_STATUSES.Completed
                            })
                        })
                    }))
                )
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



        const TEST_RECIPE_ORDER_SHOULD_PASS = {

            id: 1225,
            recipe_order_group_id: TEST_ORDER_GROUP_ID,
            status: RECIPE_ORDER_STATUSES.Pending,
            side: ORDER_SIDES.Buy,
            Instrument: TEST_INSTRUMENTS[0],
            target_exchange: {
                id: TEST_EXCHANGE_IDS[0],
                name: 'Test exchange'
            },
            target_exchange_id: TEST_EXCHANGE_IDS[0]
        }

        const TEST_RECIPE_ORDER_NO_EXCHANGE = {

            id: 1226,
            recipe_order_group_id: TEST_ORDER_GROUP_ID,
            status: RECIPE_ORDER_STATUSES.Pending,
            side: ORDER_SIDES.Buy,
            Instrument: TEST_INSTRUMENTS[0],
            target_exchange: {
                id: TEST_EXCHANGE_IDS[1],
                name: 'BAD Test exchange'
            },
            target_exchange_id: TEST_EXCHANGE_IDS[1]
        }

        const TEST_RECIPE_ORDER_NO_MARKET = {

            id: 1225,
            recipe_order_group_id: TEST_ORDER_GROUP_ID,
            status: RECIPE_ORDER_STATUSES.Pending,
            side: ORDER_SIDES.Buy,
            Instrument: TEST_INSTRUMENTS[1],
            target_exchange: {
                id: TEST_EXCHANGE_IDS[0],
                name: 'Test exchange'
            },
            target_exchange_id: TEST_EXCHANGE_IDS[0]
        }

        beforeEach(done => {
            sinon.stub(RecipeOrder, 'update').callsFake(options => {

                return Promise.resolve([1]);
            });
            done();
        });

        afterEach(done => {
            
            [
                RecipeRun.findById,
                RecipeRunDetail.findAll,
                RecipeRunDeposit.findAll,
                Instrument.findAll,
                Asset.findAll,
                InstrumentExchangeMapping.findAll,
                InstrumentMarketData.findAll,
                RecipeOrderGroup.findById,
                RecipeOrderGroup.create,
                RecipeOrder.create,
                RecipeOrder.findAll,
                RecipeOrder.update,
                ccxtUtils.getConnector,
                ccxtUtils.allConnectors
            ].forEach(model => {

                if (model.restore) {
                    model.restore();
                }
            });
            
            done();
        });

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

        it("shall reject if the user tries to approve the group, whose status is not Pending", () => {

            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {

                return Promise.resolve(Object.assign({}, TEST_RECIPE_ORDER_GROUP, { approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved }));
            });

            return chai.assert.isRejected(ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, APPROVE_COMMENT));
        });

        it ("shall reject if a recipe order doesnt have valid exchange", () => {
            //the group is OK
            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {
                let new_group = Object.assign({}, TEST_RECIPE_ORDER_GROUP);
                new_group.save = () => {
                    return Promise.resolve(new_group);
                };
                return Promise.resolve(new_group);
            });

            //the orders are bad + good
            sinon.stub(RecipeOrder, 'findAll').callsFake(options => {
                let obj_ok = Object.assign({}, TEST_RECIPE_ORDER_SHOULD_PASS)
                obj_ok.save = async () => {
                    return Promise.resolve(obj_ok);
                }
                let obj_bad = Object.assign({}, TEST_RECIPE_ORDER_NO_EXCHANGE)
                return Promise.resolve([
                    obj_ok,
                    obj_bad
                ])
            });
            sinon.stub(ccxtUtils, 'allConnectors').callsFake(options => {

                return Promise.resolve({
                    [String(TEST_EXCHANGE_IDS[0])]: {
                        name: 'Test Connector',
                        getMarket: (symbol) => {
                            if (symbol == TEST_INSTRUMENTS[0].symbol) {
                                return {
                                    active: true
                                }
                            } else {
                                return null
                            }
                        }
                    }
                })
            });

            return chai.assert.isRejected(ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, APPROVE_COMMENT));
        });

        it ("shall reject if a recipe order doesnt have valid market on exchange", () => {
            //the group is OK
            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {
                let new_group = Object.assign({}, TEST_RECIPE_ORDER_GROUP);
                new_group.save = () => {
                    return Promise.resolve(new_group);
                };
                return Promise.resolve(new_group);
            });

            //the orders are bad + good
            sinon.stub(RecipeOrder, 'findAll').callsFake(options => {
                let obj_ok = Object.assign({}, TEST_RECIPE_ORDER_SHOULD_PASS)
                obj_ok.save = async () => {
                    return Promise.resolve(obj_ok);
                }
                let obj_bad = Object.assign({}, TEST_RECIPE_ORDER_NO_MARKET)
                return Promise.resolve([
                    obj_ok,
                    obj_bad
                ])
            });
            sinon.stub(ccxtUtils, 'allConnectors').callsFake(options => {

                return Promise.resolve({
                    [String(TEST_EXCHANGE_IDS[0])]: {
                        name: 'Test Connector',
                        getMarket: (symbol) => {
                            if (symbol == TEST_INSTRUMENTS[0].symbol) {
                                return {
                                    active: true
                                }
                            } else {
                                return null
                            }
                        }
                    }
                })
            });

            return chai.assert.isRejected(ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, APPROVE_COMMENT));
        })

        it("shall approve recipe order group when approval is required and update the related order status to Executing", () => {

            sinon.stub(RecipeOrderGroup, 'findById').callsFake(options => {
                let new_group = Object.assign({}, TEST_RECIPE_ORDER_GROUP);
                new_group.save = () => {
                    return Promise.resolve(new_group);
                };
                return Promise.resolve(new_group);
            });

            sinon.stub(RecipeOrder, 'findAll').callsFake(options => {
                let obj = Object.assign({}, TEST_RECIPE_ORDER_SHOULD_PASS)
                obj.save = async () => {
                    return Promise.resolve(obj);
                }
                return Promise.resolve([
                    obj
                ])
            });
            sinon.stub(ccxtUtils, 'allConnectors').callsFake(options => {

                return Promise.resolve({
                    [String(TEST_EXCHANGE_IDS[0])]: {
                        name: 'Test Connector',
                        getMarket: (symbol) => {
                            if (symbol == TEST_INSTRUMENTS[0].symbol) {
                                return {
                                    active: true
                                }
                            } else {
                                return null
                            }
                        }
                    }
                })
            })

            return ordersService.changeRecipeOrderGroupStatus(TEST_USER_ID, TEST_ORDER_GROUP_ID, RECIPE_ORDER_GROUP_STATUSES.Approved, APPROVE_COMMENT).then(recipe_data => {

                RecipeOrderGroup.findById.restore();

                chai.assert.isNotNull(recipe_data, 'Should have returned recipe order group and orders in it!');
                chai.expect(recipe_data).is.a('array');
                let [recipe_order, orders] = recipe_data;
                chai.assert.isNotNull(recipe_order, 'Should have returned recipe order!');
                chai.expect(orders).is.a('array');
                chai.assert.equal(recipe_order.approval_status, RECIPE_ORDER_GROUP_STATUSES.Approved, 'Status was not Approved!');
                chai.assert.equal(recipe_order.approval_user_id, TEST_USER_ID, 'Approval not provided by specified user!');
                chai.assert.equal(recipe_order.approval_comment, APPROVE_COMMENT, 'approval comment not as specified!');

                orders.map(order => {
                    chai.assert.equal(order.recipe_order_group_id, TEST_ORDER_GROUP_ID);
                    chai.assert.equal(order.status, RECIPE_ORDER_STATUSES.Executing, `order ${order} is not executing!`);
                });

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

    describe('and the method changeExecutionOrderStatus shall:', () => {

        before(done => {
            sinon.stub(ExecutionOrder, 'findById').callsFake(execution_id => {
                switch(execution_id) {
                    case 1:
                        return Promise.resolve(TEST_EXECUTION_ORDER);
                    case 2:
                        return Promise.resolve(Object.assign({}, TEST_EXECUTION_ORDER, {
                            status: EXECUTION_ORDER_STATUSES.Failed
                        }));
                    default:
                        return Promise.resolve(null);
                }
            });
            done();
        });

        after(done => {
            ExecutionOrder.findById.restore();
            done();
        });

        const changeExecutionOrderStatus = ordersService.changeExecutionOrderStatus;

        it('exist', () => {
            return chai.expect(changeExecutionOrderStatus).to.be.not.undefined;
        });

        it('reject if the passed arguments are not valid', () => {
            return Promise.all(_.map([
                [],
                [1, '123'],
                ['ff', 21],
                [{}, 2],
                [1, {}]
            ], params => {
                return chai.assert.isRejected(changeExecutionOrderStatus(...params));
            }));
        });

        it('reject if the user tries to reinitiate an execution order when it is not Failed', () => {
            return chai.assert.isRejected(changeExecutionOrderStatus(1, EXECUTION_ORDER_STATUSES.Pending));
        });

        it('update the status to Pending when the execution order is Failed', () => {
            return changeExecutionOrderStatus(2, EXECUTION_ORDER_STATUSES.Pending).then(execution_order_data => {

                chai.expect(execution_order_data).to.be.an('object');
                chai.expect(execution_order_data.original_execution_order).to.be.an('object');
                chai.expect(execution_order_data.updated_execution_order).to.be.an('object');

                const { original_execution_order, updated_execution_order } = execution_order_data;

                chai.expect(original_execution_order.status).to.equal(EXECUTION_ORDER_STATUSES.Failed);
                chai.expect(updated_execution_order.status).to.equal(EXECUTION_ORDER_STATUSES.Pending);

                chai.expect(updated_execution_order.failed_attempts).to.equal(0);

            });
        });

    });
});