"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('DepositService testing', () => {

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);

            //sinon.stub(ActionLogUtil, 'logAction').callsFake(() => {return;});

            sinon.stub(sequelize, 'transaction').callsFake(async (options, callback) => {
                if(_.isFunction(options)) callback = options;
                return callback();
            });

            done();
        })
    });

    after(done => {
        //ActionLogUtil.logAction.restore();
        sequelize.transaction.restore();
        done();
    });

    const DepositService = require('./../../services/DepositService');
    const User = require('./../../models').User;
    const RecipeRun = require('./../../models').RecipeRun;
    const RecipeRunDeposit = require('./../../models').RecipeRunDeposit;
    const RecipeRunDetail = require('./../../models').RecipeRunDetail;
    const ExchangeAccount = require('./../../models').ExchangeAccount;
    const Exchange = require('./../../models').Exchange;
    const Asset = require('./../../models').Asset;
    const InvestmentAssetConversion = require('./../../models').InvestmentAssetConversion;
    const sequelize = require('./../../models').sequelize;

    const ActionLogUtil = require('./../../utils/ActionLogUtil');

    const MOCK_USER = {
        logAction() { return Promise.resolve() }
    }

    describe('and method submitDeosit shall', () => {

        const { Pending, Completed } = MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES;

        const MOCK_BASE_DEPOSIT = {
            id: 1,
            creation_timestamp: new Date(),
            recipe_run_id: 1,
            amount: null,
            depositor_user_id: null,
            completion_timestamp: null,
            target_exchange_account_id: 45,
            status: Pending,
            asset_id: 24,
            fee: null,
            save() { return Promise.resolve(this) },
            toJSON() { return this; }
        };

        before(done => {

            sinon.stub(RecipeRunDeposit, 'findById').callsFake(deposit_id => {
                switch(deposit_id) {
                    case 1:
                        return Promise.resolve(Object.assign({}, MOCK_BASE_DEPOSIT, {
                            status: Completed,
                        }));
                    case 2:
                        return Promise.resolve(Object.assign({}, MOCK_BASE_DEPOSIT));
                    default: 
                        return Promise.resolve(null);
                }
            });

            done();

        });

        after(done => {

            RecipeRunDeposit.findById.restore();
            done();

        });

        it('exist', () => {
            chai.expect(DepositService.approveDeposit).to.not.be.undefined;
        });

        it('reject if the required arguments are missing or invalid', () => {
            return Promise.all(_.map([
                {},
                { deposit_management_fee: -1, amount: -1 },
                { deposit_management_fee: '22f', amount: 'fg' },
                { deposit_management_fee: [], amount: [1] }
            ], params => {
                chai.assert.isRejected(DepositService.submitDeposit(2, MOCK_USER, params));
            }))
        });

        it('reject if the deposit status is not Pending', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return chai.assert.isRejected(DepositService.submitDeposit(1, MOCK_USER, valid_update));
        });

        it('resolve in a null when a deposit is not found at all', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return DepositService.submitDeposit(999, MOCK_USER, valid_update).then(deposit => {
                chai.expect(deposit).to.be.null;
            });
        });

        it('submit a Pending deposit and update it appropriately', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };
            const user = MOCK_USER

            return DepositService.submitDeposit(2, user, valid_update).then(deposit_data => {

                const deposit = deposit_data.updated_deposit;

                chai.expect(deposit).to.be.an('object');
                chai.expect(deposit.status).to.equal(MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending);
                chai.expect(deposit.fee).to.equal(valid_update.deposit_management_fee);
                chai.expect(deposit.amount).to.equal(valid_update.amount);
                chai.expect(deposit.depositor_user_id).to.be.null;
                chai.expect(deposit.completion_timestamp).to.be.null;

            });
        });

    });

    describe('and method approveDeosit shall', () => {

        const { Pending, Completed } = MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES;

        const MOCK_BASE_DEPOSIT = {
            id: 1,
            creation_timestamp: new Date(),
            recipe_run_id: 1,
            amount: null,
            depositor_user_id: null,
            completion_timestamp: null,
            target_exchange_account_id: 45,
            status: Pending,
            asset_id: 24,
            fee: null,
            save() { return Promise.resolve(this) },
            toJSON() { return this; }
        };

        const MOCK_APPROVE_READY_DEPOSIT = {
            id: 3, 
            creation_timestamp: new Date(),
            recipe_run_id: 1,
            amount: '4.11',
            depositor_user_id: null,
            completion_timestamp: null,
            target_exchange_account_id: 45,
            status: Pending,
            asset_id: 24,
            fee: '0.25',
            save() { return Promise.resolve(this) },
            toJSON() { return this; }
        }

        before(done => {

            sinon.stub(RecipeRunDeposit, 'findById').callsFake(deposit_id => {
                switch(deposit_id) {
                    case 1:
                        return Promise.resolve(Object.assign({}, MOCK_BASE_DEPOSIT, {
                            status: Completed,
                        }));
                    case 2:
                        return Promise.resolve(Object.assign({}, MOCK_BASE_DEPOSIT));
                    case 3:
                        return Promise.resolve(Object.assign({}, MOCK_APPROVE_READY_DEPOSIT));
                    default: 
                        return Promise.resolve(null);
                }
            });

            done();

        });

        after(done => {

            RecipeRunDeposit.findById.restore();
            done();

        });

        it('exist', () => {
            chai.expect(DepositService.approveDeposit).to.not.be.undefined;
        });

        it('reject if the required arguments are missing or invalid', () => {
            return Promise.all(_.map([
                {},
                { amount: 1 },
                { deposit_management_fee: 1 },
                { deposit_management_fee: -1, amount: 2 },
                { deposit_management_fee: 45, amount: 'fg' }
            ], params => {
                chai.assert.isRejected(DepositService.approveDeposit(2, 1, params));
            }))
        });

        it('reject if the deposit status is not Pending', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return chai.assert.isRejected(DepositService.approveDeposit(1, 1, valid_update));
        });

        it('resolve in a null when a deposit is not found at all', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return DepositService.approveDeposit(999, 1, valid_update).then(deposit => {
                chai.expect(deposit).to.be.null;
            });
        });

        it('approve a Pending deposit and update it appropriately', () => {
            const user_id = 1

            return DepositService.approveDeposit(3, user_id).then(deposit_data => {

                const deposit = deposit_data.updated_deposit;

                chai.expect(deposit).to.be.an('object');
                chai.expect(deposit.status).to.equal(MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Completed);
                chai.expect(deposit.fee).to.equal(MOCK_APPROVE_READY_DEPOSIT.fee);
                chai.expect(deposit.amount).to.equal(MOCK_APPROVE_READY_DEPOSIT.amount);
                chai.expect(deposit.depositor_user_id).to.equal(user_id);
                chai.expect(deposit.completion_timestamp).to.a('date');

            });
        });

    });

    describe('an method generateRecipeRunDeposits shall', () => {

        const MOCK_DETAILS = [{
            quote_asset_id: 1,
            target_exchange_id: 2,
            investment_percentage: 20,
            amount: 10
        }, {
            quote_asset_id: 1,
            target_exchange_id: 1,
            investment_percentage: 30,
            amount: 0
        }, {
            quote_asset_id: 2,
            target_exchange_id: 3,
            investment_percentage: 50,
            amount: 20
        }];

        const MOCK_EXCHANGE_ACCOUNTS = [{
            id: 1,
            exchange_id: 1,
            asset_id: 1
        }, {
            id: 2,
            exchange_id: 3,
            asset_id: 2
        }, {
            id: 3,
            exchange_id: 2,
            asset_id: 1
        }];

        const MOCK_RECIPE_RUNS = [{
            id: 1,
            approval_status: RECIPE_RUN_STATUSES.Approved
        }, {
            id: 2,
            approval_status: RECIPE_RUN_STATUSES.Rejected
        }];

        const MOCK_COMPLETED_CONVERSIONS = [{
            target_asset_id: 1,
            amount: 100,
            status: ASSET_CONVERSION_STATUSES.Completed
        },{
            target_asset_id: 2,
            amount: 50,
            status: ASSET_CONVERSION_STATUSES.Completed
        }];

        const MOCK_PARTIALY_COMPLETED_CONVERSIONS = [{
            target_asset_id: 3,
            amount: null,
            status: ASSET_CONVERSION_STATUSES.Pending
        }].concat(MOCK_COMPLETED_CONVERSIONS);

        const EXPECTED_AMOUNTS = {
            '1-3': 44,
            '1-1': 66,
            '2-2': 70
        };

        before(done => {
            sinon.stub(ExchangeAccount, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_EXCHANGE_ACCOUNTS);
            });
            sinon.stub(RecipeRunDeposit, 'bulkCreate').callsFake(deposits => {
                return Promise.resolve(deposits);
            });
            sinon.stub(RecipeRun, 'findById').callsFake(id => {
                return Promise.resolve(
                    MOCK_RECIPE_RUNS.find(r => r.id === id) || null
                );
            });
            sinon.stub(RecipeRunDeposit, 'findAll').callsFake(async options => {
                return [];
            })
            done();
        });

        after(done => {
            ExchangeAccount.findAll.restore();
            RecipeRunDeposit.bulkCreate.restore();
            RecipeRun.findById.restore();
            RecipeRunDeposit.findAll.restore();
            done();
        });

        afterEach(done => {
            if(RecipeRunDetail.findAll.restore) RecipeRunDetail.findAll.restore();
            if(Exchange.findAll.restore) Exchange.findAll.restore();
            if(Asset.findAll.restore) Asset.findAll.restore();
            if(InvestmentAssetConversion.findAll.restore) InvestmentAssetConversion.findAll.restore();
            if(sequelize.query.restore) sequelize.query.restore();
            done();
        });

        it('exist', () => {
            return chai.expect(DepositService.generateRecipeRunDeposits).to.be.not.undefined;
        });

        it('return null if the recipe run was not found', () => {

            return DepositService.generateRecipeRunDeposits(-1).then(result => {
                chai.expect(result).to.equal(null);
            });

        });

        it('reject if the recipe run status is not Approved', () => {

            return chai.assert.isRejected(DepositService.generateRecipeRunDeposits(2));

        });

        it('reject if there are incomplete asset conversion', () => {

            sinon.stub(InvestmentAssetConversion, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_PARTIALY_COMPLETED_CONVERSIONS);
            });

            return chai.assert.isRejected(DepositService.generateRecipeRunDeposits(1));

        });

        it('reject if the are missing exchange accounts', () => {
            const extra_detail = {
                quote_asset_id: 2112,
                target_exchange_id: 12313213
            };

            sinon.stub(sequelize, 'query').callsFake(query => {
                return Promise.resolve([extra_detail, ...MOCK_DETAILS]);
            });

            sinon.stub(Exchange, 'findAll').callsFake(options => {
                return Promise.resolve([{
                    id: extra_detail.target_exchange_id,
                    name: 'Test'
                }]);
            });

            sinon.stub(Asset, 'findAll').callsFake(options => {
                return Promise.resolve([{
                    id: extra_detail.quote_asset_id,
                    symbol: 'DOGE'
                }]);
            });

            sinon.stub(InvestmentAssetConversion, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_COMPLETED_CONVERSIONS);
            });

            return chai.assert.isRejected(DepositService.generateRecipeRunDeposits(1));
        });

        it('generate new deposits by matching the details and exchange accounts', () => {
            
            sinon.stub(InvestmentAssetConversion, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_COMPLETED_CONVERSIONS);
            });

            sinon.stub(sequelize, 'query').callsFake(query => {
                return Promise.resolve(MOCK_DETAILS);
            });

            return DepositService.generateRecipeRunDeposits(1).then(deposits => {

                chai.expect(deposits.length).to.equal(MOCK_EXCHANGE_ACCOUNTS.length);

                for(let deposit of deposits) {
                    const exchange_account = MOCK_EXCHANGE_ACCOUNTS.find(ex => ex.id === deposit.target_exchange_account_id);

                    chai.expect(deposit.creation_timestamp).to.be.a('date');
                    chai.expect(deposit.recipe_run_id).to.equal(MOCK_RECIPE_RUNS[0].id);
                    chai.expect(deposit.asset_id).to.equal(exchange_account.asset_id);
                    chai.expect(deposit.status).to.equal(RECIPE_RUN_DEPOSIT_STATUSES.Pending);

                    chai.expect(parseInt(deposit.amount)).to.equal(
                        EXPECTED_AMOUNTS[`${deposit.asset_id}-${deposit.target_exchange_account_id}`]
                    );
                }

            });
        });
    });

    describe('and method generate generateAssetConversions shall', () => {

        const generateAssetConversions = DepositService.generateAssetConversions;

        const MOCK_ASSETS = [{
            id: 1,
            is_base: false,
            is_deposit: true,
            symbol: 'USD'
        }, {
            id: 2,
            is_base: true,
            is_deposit: true,
            symbol: 'BTC'
        }, {
            id: 1,
            is_base: true,
            is_deposit: true,
            symbol: 'ETH'
        }];

        const MOCK_RECIPE_RUN = {
            id: 1
        };

        const MOCK_MATCHING_DETAILS = [
            {
                recipe_run_id: MOCK_RECIPE_RUN.id,
                quote_asset_id: MOCK_ASSETS[1].id,
                RecipeRunDetailInvestments: [{
                    asset_id: MOCK_ASSETS[0].id,
                    amount: 100
                },{
                    asset_id: MOCK_ASSETS[1].id,
                    amount: 1
                },{
                    asset_id: MOCK_ASSETS[2].id,
                    amount: 10
                }]
            },
            {
                recipe_run_id: MOCK_RECIPE_RUN.id,
                quote_asset_id: MOCK_ASSETS[2].id,
                RecipeRunDetailInvestments: [{
                    asset_id: MOCK_ASSETS[0].id,
                    amount: 200
                },{
                    asset_id: MOCK_ASSETS[1].id,
                    amount: 0
                },{
                    asset_id: MOCK_ASSETS[2].id,
                    amount: 5
                }]
            },
            {
                recipe_run_id: MOCK_RECIPE_RUN.id,
                quote_asset_id: MOCK_ASSETS[2].id,
                RecipeRunDetailInvestments: [{
                    asset_id: MOCK_ASSETS[0].id,
                    amount: 150
                },{
                    asset_id: MOCK_ASSETS[1].id,
                    amount: 5
                },{
                    asset_id: MOCK_ASSETS[2].id,
                    amount: 0
                }]
            }
        ]

        //Details that don't have USD in them, basically
        const MOCK_MISMATCHING_DETAILS = MOCK_MATCHING_DETAILS.map(detail => {

            const missing_investment_assets = detail.RecipeRunDetailInvestments.filter(inv => inv.asset_id !== MOCK_ASSETS[0].id);

            return Object.assign({}, detail, { RecipeRunDetailInvestments: missing_investment_assets });

        });

        before(done => {

            sinon.stub(Asset, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_ASSETS);
            });

            done(); 
        });

        afterEach(done => {

            if(RecipeRunDetail.findAll.restore) RecipeRunDetail.findAll.restore();

            done();
        });

        after(done => {

            Asset.findAll.restore();

            done();
        });

        it('exist', () => {

            chai.expect(generateAssetConversions).to.be.not.undefined;

        });

        it('reject if Recipe Run Detailswere not found', () => {

            sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {
                return Promise.resolve([]);
            });

            return chai.assert.isRejected(generateAssetConversions({}));
            
        });

        it('return an empty list if none of the assets match', () => {

            sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_MISMATCHING_DETAILS);
            });

            return generateAssetConversions(MOCK_RECIPE_RUN).then(result => {

                chai.expect(result.length).to.equal(0);

            });
            
        });

        it('return an list of conversion with matching assets', () => {

            sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_MATCHING_DETAILS);
            });

            return generateAssetConversions(MOCK_RECIPE_RUN).then(result => {

                chai.expect(result.length).to.be.greaterThan(0);

                for(let conversion of result) {

                    chai.expect(conversion.investment_asset_id).to.equal(MOCK_ASSETS[0].id);
                    chai.expect(conversion.recipe_run_id).to.equal(MOCK_RECIPE_RUN.id);
                    chai.expect(conversion.target_asset_id).to.be.oneOf(
                        MOCK_ASSETS.filter(asset => asset.is_base).map(asset => asset.id)
                    );

                }

            });
            
        });

    });

    describe('and the method submitAssetConversion shall', () => {

        const submitAssetConversion = DepositService.submitAssetConversion;

        const MOCK_DEPOSITOR = {
            id: 1,
            first_name: 'Depositor',
            last_name: 'Jeremy',
            logAction: User.prototype.logAction
        };

        const MOCK_PENDING_CONVERSION = {
            id: 1,
            amount: null,
            created_timestamp: new Date(),
            completed_timestamp: null,
            depositor_user_id: null,
            recipe_run_id: 1,
            status: ASSET_CONVERSION_STATUSES.Pending,
            investment_asset_id: 1,
            target_asset_id: 2,
            save: function() {
                return Promise.resolve(this);
            }
        };

        const MOCK_COMPLETED_CONVERSION = _.assign({}, MOCK_PENDING_CONVERSION, {
            id: 2,
            completed_timestamp: new Date(),
            depositor_user_id: 2,
            amount: 1000,
            status: ASSET_CONVERSION_STATUSES.Completed
        });

        const MOCK_CONVERSIONS = [ MOCK_PENDING_CONVERSION, MOCK_COMPLETED_CONVERSION ];

        let MOCK_FORCED_CONVERSION = {};

        const CONVERSION_AMOUNT = _.random(100, 1000);

        before(done => {

            sinon.stub(InvestmentAssetConversion, 'findById').callsFake(id => {

                if(MOCK_FORCED_CONVERSION.id === id) return Promise.resolve(MOCK_FORCED_CONVERSION);

                const conversion = _.find(MOCK_CONVERSIONS, c => c.id === id) || null;

                if(!conversion) return Promise.resolve(null);

                return Promise.resolve(_.assign({}, conversion));
                
            });

            done();
        });

        after(done => {

            InvestmentAssetConversion.findById.restore();

            done()
        });;

        it('exist', () => {

            chai.expect(submitAssetConversion).to.be.not.undefined;

        });

        it('reject if the amount is invalid', () => {

            return chai.assert.isRejected(submitAssetConversion(MOCK_PENDING_CONVERSION.id, -1, MOCK_DEPOSITOR));

        });

        it('return null if the conversion was not found', () => {

            return submitAssetConversion(0, CONVERSION_AMOUNT, MOCK_DEPOSITOR).then(conversion => {
                chai.expect(conversion).to.be.null;
            });

        });

        it('reject if the conversion was already Completed', () => {

            return chai.assert.isRejected(submitAssetConversion(MOCK_COMPLETED_CONVERSION.id, CONVERSION_AMOUNT, MOCK_DEPOSITOR));

        });

        it('reject if the conversion amount is not set when attempting to complete it', () => {

            return chai.assert.isRejected(submitAssetConversion(MOCK_PENDING_CONVERSION.id, null, MOCK_DEPOSITOR, true));

        });

        it('submit the conversion amount but complete the conversion', () => {

            return submitAssetConversion(MOCK_PENDING_CONVERSION.id, CONVERSION_AMOUNT, MOCK_DEPOSITOR).then(conversion => {

                chai.expect(conversion).to.be.not.null;

                chai.expect(conversion.completed_timestamp).to.be.null
                chai.expect(conversion.depositor_user_id).to.be.null;
                chai.expect(conversion.status).to.equal(ASSET_CONVERSION_STATUSES.Pending);
                chai.expect(conversion.amount).to.equal(CONVERSION_AMOUNT);

            });

        });

        it('complete a conversion is the conditions are met', () => {

            return submitAssetConversion(MOCK_PENDING_CONVERSION.id, CONVERSION_AMOUNT, MOCK_DEPOSITOR, true).then(conversion => {

                chai.expect(conversion).to.be.not.null;

                chai.expect(conversion.completed_timestamp).to.be.a('date');
                chai.expect(conversion.depositor_user_id).to.equal(MOCK_DEPOSITOR.id);
                chai.expect(conversion.status).to.equal(ASSET_CONVERSION_STATUSES.Completed);
                chai.expect(conversion.amount).to.equal(CONVERSION_AMOUNT);

            });

        });

        it('complete a conversion without the amount if it was submitted before', () => {

            return submitAssetConversion(MOCK_PENDING_CONVERSION.id, CONVERSION_AMOUNT, MOCK_DEPOSITOR, false).then(conversion => {

                chai.expect(conversion).to.be.not.null;

                MOCK_FORCED_CONVERSION = conversion;

                return submitAssetConversion(MOCK_FORCED_CONVERSION.id, null, MOCK_DEPOSITOR, true).then(conversion => {

                    chai.expect(conversion).to.be.not.null;

                    chai.expect(conversion.completed_timestamp).to.be.a('date');
                    chai.expect(conversion.depositor_user_id).to.equal(MOCK_DEPOSITOR.id);
                    chai.expect(conversion.status).to.equal(ASSET_CONVERSION_STATUSES.Completed);
                    chai.expect(conversion.amount).to.equal(CONVERSION_AMOUNT);

                    MOCK_FORCED_CONVERSION = {};

                });

            });

        });

    });
});