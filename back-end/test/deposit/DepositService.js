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

            done();
        })
    });

    after(done => {
        //ActionLogUtil.logAction.restore();
        done();
    });

    const DepositService = require('./../../services/DepositService');
    const RecipeRunDeposit = require('./../../models').RecipeRunDeposit;
    const RecipeRunDetail = require('./../../models').RecipeRunDetail;
    const ExchangeAccount = require('./../../models').ExchangeAccount;
    const Exchange = require('./../../models').Exchange;
    const Asset = require('./../../models').Asset;
    const InvestmentAssetConversion = require('./../../models').InvestmentAssetConversion;

    const ActionLogUtil = require('./../../utils/ActionLogUtil');

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
                chai.assert.isRejected(DepositService.submitDeposit(2, 1, params));
            }))
        });

        it('reject if the deposit status is not Pending', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return chai.assert.isRejected(DepositService.submitDeposit(1, 1, valid_update));
        });

        it('resolve in a null when a deposit is not found at all', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return DepositService.submitDeposit(999, 1, valid_update).then(deposit => {
                chai.expect(deposit).to.be.null;
            });
        });

        it('submit a Pending deposit and update it appropriately', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };
            const user_id = 1

            return DepositService.submitDeposit(2, user_id, valid_update).then(deposit_data => {

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
            target_exchange_id: 2
        }, {
            quote_asset_id: 1,
            target_exchange_id: 1
        }, {
            quote_asset_id: 2,
            target_exchange_id: 3
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
            id: 1,
            exchange_id: 2,
            asset_id: 1
        }];

        const MOCK_RECIPE_RUN = {
            id: 1,
            approval_status: RECIPE_RUN_STATUSES.Approved
        };

        before(done => {
            sinon.stub(ExchangeAccount, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_EXCHANGE_ACCOUNTS);
            });
            sinon.stub(RecipeRunDeposit, 'bulkCreate').callsFake(deposits => {
                return Promise.resolve(deposits);
            });
            done();
        });

        after(done => {
            ExchangeAccount.findAll.restore();
            RecipeRunDeposit.bulkCreate.restore();
            done();
        });

        afterEach(done => {
            if(RecipeRunDetail.findAll.restore) RecipeRunDetail.findAll.restore();
            if(Exchange.findAll.restore) Exchange.findAll.restore();
            if(Asset.findAll.restore) Asset.findAll.restore();
            done();
        });

        it('exist', () => {
            return chai.expect(DepositService.generateRecipeRunDeposits).to.be.not.undefined;
        });

        it('reject if the are missing exchange accounts', () => {
            const extra_detail = {
                quote_asset_id: 2112,
                target_exchange_id: 12313213
            };

            sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {
                return Promise.resolve([].concat(MOCK_DETAILS, [extra_detail]));
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

            return chai.assert.isRejected(DepositService.generateRecipeRunDeposits(MOCK_RECIPE_RUN));
        });

        it('generate new deposits by matching the details and exchange accounts', () => {
            sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {
                return Promise.resolve(MOCK_DETAILS);
            });

            return DepositService.generateRecipeRunDeposits(MOCK_RECIPE_RUN).then(deposits => {

                chai.expect(deposits.length).to.equal(MOCK_EXCHANGE_ACCOUNTS.length);

                for(let deposit of deposits) {
                    const exchange_account = MOCK_EXCHANGE_ACCOUNTS.find(ex => ex.id === deposit.target_exchange_account_id);

                    chai.expect(deposit.creation_timestamp).to.be.a('date');
                    chai.expect(deposit.recipe_run_id).to.equal(MOCK_RECIPE_RUN.id);
                    chai.expect(deposit.asset_id).to.equal(exchange_account.asset_id);
                    chai.expect(deposit.status).to.equal(RECIPE_RUN_DEPOSIT_STATUSES.Pending);
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

    describe('and the method completeAssetConversion shall', () => {

        const completeAssetConversion = DepositService.completeAssetConversion;

        const MOCK_DEPOSITOR = {
            id: 1
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

        const CONVERSION_AMOUNT = _.random(100, 1000);

        before(done => {

            sinon.stub(InvestmentAssetConversion, 'findById').callsFake(id => {

                return Promise.resolve(_.find(MOCK_CONVERSIONS, c => c.id === id) || null);
                
            });

            done();
        });

        after(done => {

            InvestmentAssetConversion.findById.restore();

            done()
        });;

        it('exist', () => {

            chai.expect(completeAssetConversion).to.be.not.undefined;

        });

        it('reject if the amount is invalid', () => {

            return chai.assert.isRejected(completeAssetConversion(MOCK_PENDING_CONVERSION.id, -1, MOCK_DEPOSITOR));

        });

        it('return null if the conversion was not found', () => {

            return completeAssetConversion(0, CONVERSION_AMOUNT, MOCK_DEPOSITOR).then(conversion => {
                chai.expect(conversion).to.be.null;
            });

        });

        it('reject if the conversion was already Completed', () => {

            return chai.assert.isRejected(completeAssetConversion(MOCK_COMPLETED_CONVERSION.id, CONVERSION_AMOUNT, MOCK_DEPOSITOR));

        });

        it('complete a conversion is the conditions are met', () => {

            return completeAssetConversion(MOCK_PENDING_CONVERSION.id, CONVERSION_AMOUNT, MOCK_DEPOSITOR).then(conversion => {

                chai.expect(conversion).to.be.not.null;

                chai.expect(conversion.completed_timestamp).to.be.a('date');
                chai.expect(conversion.depositor_user_id).to.equal(MOCK_DEPOSITOR.id);
                chai.expect(conversion.status).to.equal(ASSET_CONVERSION_STATUSES.Completed);
                chai.expect(conversion.amount).to.equal(CONVERSION_AMOUNT);

            });

        });

    });
});