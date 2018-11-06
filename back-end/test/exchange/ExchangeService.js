"use strict";

const app = require("../../app");
const chai = require("chai");
const asPromised = require('chai-as-promised');
const should = chai.should();
const sinon = require("sinon");

const { expect, assert } = chai;

chai.use(asPromised);

describe('ExchangeService testing', () => {

    const ExchangeService = require('./../../services/ExchangeService');
    const Asset = require('./../../models').Asset;
    const Exchange = require('./../../models').Exchange;
    const ExchangeAccount = require('./../../models').ExchangeAccount;
    const ExchangeCredential = require('./../../models').ExchangeCredential;
    const InstrumentExchangeMapping = require('./../../models').InstrumentExchangeMapping;
    const InvestmentRun = require('./../../models').InvestmentRun;
    const sequelize = require('./../../models').sequelize;

    const ccxtUtils = require('./../../utils/CCXTUtils');

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);

            sinon.stub(sequelize, 'transaction').callsFake(async (options, callback) => {
                if(_.isFunction(options)) callback = options;
                return callback();
            });

            done();
        })
    });

    after(done => {

        sequelize.transaction.restore();

        done();
    });

    describe('and method createExchangeAccount shall', () => {

        const { Trading, Withdrawal } = MODEL_CONST.EXCHANGE_ACCOUNT_TYPES

        before(done => {

            sinon.stub(InstrumentExchangeMapping, 'count').callsFake(options => {
                const exchange_id = options.where.exchange_id;

                switch (exchange_id) {
                    case 1:
                        return Promise.resolve(1);
                    default:
                        return Promise.resolve(0);
                }
            });

            sinon.stub(Exchange, 'count').callsFake(options => {
                const exchange_account = options.where.id;

                switch (exchange_account) {
                    case 1:
                        return Promise.resolve(1);
                    default:
                        return Promise.resolve(0);
                }
            });

            sinon.stub(ExchangeAccount, 'count').callsFake(options => {
                const account_type = options.where.account_type;

                switch (account_type) {
                    case Withdrawal:
                        return Promise.resolve(1);
                    default:
                        return Promise.resolve(0);
                }
            });

            sinon.stub(ExchangeAccount, 'create').callsFake(options => {
                return Promise.resolve(options);
            });

            done();

        });

        after(done => {
            InstrumentExchangeMapping.count.restore();
            Exchange.count.restore();
            ExchangeAccount.count.restore();
            ExchangeAccount.create.restore();

            done();
        });

        it('exist', () => {
            chai.expect(ExchangeService.createExchangeAccount).to.not.be.undefined;
        });

        it('reject if the any of the arguments are missing', () => {
            return Promise.all(_.map([
                [1],
                [1, 2],
                [1, 2, 3],
                [null, 2, 3, '$h23k2j4h24h2k342k4h3']
            ], params => {
                chai.assert.isRejected(ExchangeService.createExchangeAccount(...params))
            }))
        });

        it('reject if the account type is not a valid id number', () => {
            return chai.assert.isRejected(ExchangeService.createExchangeAccount(1, 2, 3, 4));
        });

        it('reject if the asset does not exist', () => {
            return chai.assert.isRejected(ExchangeService.createExchangeAccount(Trading, 2, 2, '111'));
        });

        it('reject if the exchange does not exist', () => {
            return chai.assert.isRejected(ExchangeService.createExchangeAccount(Trading, 1, 2, '111'));
        });

        it('reject if the exchange account with same params already exists', () => {
            return chai.assert.isRejected(ExchangeService.createExchangeAccount(Withdrawal, 1, 1, '111'));
        });

        it('create a new Exchange Account if all of the params are valid', () => {
            return chai.assert.isFulfilled(ExchangeService.createExchangeAccount(Trading, 1, 1, '1231232323')
                .then(account => {
                    chai.expect(ExchangeAccount.create.calledOnce).to.be.true;

                    chai.expect(account.account_type).to.equal(Trading);
                    chai.expect(account.asset_id).to.equal(1);
                    chai.expect(account.exchange_id).to.equal(1);
                    chai.expect(account.address).to.equal('1231232323');

                    return account;
                }));
        });

    });

    describe('and method editExchangeAccount shall:', () => {

        const { editExchangeAccount } = ExchangeService;

        const ACTIVE_INVESTMENT_RUN = {
            id: 1
        };

        const EXCHANGE_ACCOUNTS = [
            {
                id: 1,
                exchange_id: 1,
                address: '276%&G*G&%f5g5f*&%5',
                asset_id: 2,
                is_active: true,
                async save() {
                    return Object.assign({}, this)
                }
            }
        ];

        beforeEach(done => {

            sinon.stub(ExchangeAccount, 'findById').callsFake(async id => {

                const account = EXCHANGE_ACCOUNTS.find(a => a.id === id);

                if(!account) return null;

                return account;

            });

            done();
        });

        afterEach(done => {

            ExchangeAccount.findById.restore();
            if(InvestmentRun.findOne.restore) InvestmentRun.findOne.restore();

            done();
        });

        
        it('exist', () => {

            expect(editExchangeAccount).to.be.not.undefined;

        });

        it('reject if an active investment run was found', () => {

            sinon.stub(InvestmentRun, 'findOne').callsFake(async () => {

                return ACTIVE_INVESTMENT_RUN;

            });

            return assert.isRejected(editExchangeAccount(1, false));

        });

        it('return null if an exchange account was not found', () => {

            sinon.stub(InvestmentRun, 'findOne').callsFake(async () => {

                return null;

            });

            return editExchangeAccount(-1, false).then(result => {

                expect(result).to.be.null;

            });

        });

        it('update the status of the exchange account', () => {

            sinon.stub(InvestmentRun, 'findOne').callsFake(async () => {

                return null;

            });

            const original = Object.assign({}, EXCHANGE_ACCOUNTS[0]);

            return editExchangeAccount(EXCHANGE_ACCOUNTS[0].id, false).then(result => {
                
                expect(result).to.be.not.null;

                expect(result.is_active).to.be.false;
                expect(result.asset_id).to.equal(original.asset_id);
                expect(result.exchange_id).to.equal(original.exchange_id);
                expect(result.address).to.equal(original.address);

            });

        });

    });

    describe('and the mthod setExchangeCredentials shall', () => {

        const { setExchangeCredentials } = ExchangeService;

        const VALID_EXCHANGE_ID = 1;
        
        let DUMMY_CONNECTOR = {};

        beforeEach(done => {

            sinon.stub(Exchange, 'findById').callsFake(async id => {

                if(VALID_EXCHANGE_ID === id) return { api_id: 'okex' };
                
                return null;

            });

            sinon.stub(ExchangeCredential, 'destroy').callsFake(async options => {

                return options;

            });

            sinon.stub(ExchangeCredential, 'create').callsFake(async values => {

                return values;

            });

            sinon.stub(ccxtUtils, 'getConnector').callsFake(async api_id => {

                return DUMMY_CONNECTOR;

            });

            done();
        });

        afterEach(done => {

            Exchange.findById.restore();
            ExchangeCredential.destroy.restore();
            ExchangeCredential.create.restore();
            ccxtUtils.getConnector.restore();

            done();
        });

        it('exist', () => {

            expect(setExchangeCredentials).to.be.not.undefined;

        });

        it('reject if only passing one valid param', async () => {

            await assert.isRejected(setExchangeCredentials(VALID_EXCHANGE_ID, {
                api_key: undefined,
                api_secret: '3123131231'
            }));
            return assert.isRejected(setExchangeCredentials(VALID_EXCHANGE_ID, {
                api_key: '3123131231',
                api_secret: undefined
            }));

        });

        it('return null if the exchange was not found', () => {

            return setExchangeCredentials(-1, {
                api_key: '3123131231',
                api_secret: '3jk123j1hkjh'
            }).then(result => {

                expect(result).to.be.null;

            });

        });

        it('destroy the previous credentials and set the new ones', () => {

            const API_KEY = '3hk12j3g13g13jh1g3';
            const API_SECRET = 'kj4h2jk34h2j4h2jk4h2jh42jkh423h4jk2h4k2h4h';

            return setExchangeCredentials(VALID_EXCHANGE_ID, {
                api_key: API_KEY,
                api_secret: API_SECRET
            }).then(result => {

                expect(result).to.be.an('object');

                expect(ExchangeCredential.destroy.calledOnce).to.be.true;
                expect(ExchangeCredential.destroy.args[0][0].where.exchange_id).to.equal(VALID_EXCHANGE_ID);

                expect(result.exchange_id).to.equal(VALID_EXCHANGE_ID);
                expect(result.api_key_string).to.equal(API_KEY);
                expect(result.api_secret_string).to.equal(API_SECRET);

                expect(DUMMY_CONNECTOR.apiKey).to.equal(API_KEY);
                expect(DUMMY_CONNECTOR.secret).to.equal(API_SECRET);

            });

        });

    });

    describe('and the method deleteExchangeCredentials shall', () => {

        const { deleteExchangeCredentials } = ExchangeService;

        const MOCK_CREDENTIAL = {
            id: 1,
            exchange_id: 1,
            async save() {
                return _.assign({}, this);
            },
            api_key_string: '43h24h234kj2h4k2jh',
            api_secret_string: '432kjh42kh42j4',
            additional_params_object: {
                extra_1: '3h4jk2hj3h24jh23jk4h2',
                extra_2: '34h2kj4j543k4h53jh54'
            }
        };

        let DUMMY_CONNECTOR = {};

        beforeEach(done => {

            sinon.stub(ExchangeCredential, 'findOne').callsFake(async options => {

                if(options.where.exchange_id === MOCK_CREDENTIAL.exchange_id) return _.assign({}, MOCK_CREDENTIAL);
                return null;

            });

            sinon.stub(ccxtUtils, 'getConnector').callsFake(async api_id => {

                return DUMMY_CONNECTOR;

            });

            done();
        });

        afterEach(done => {

            ExchangeCredential.findOne.restore();
            ccxtUtils.getConnector.restore();

            done();
        });

        it('exist', () => {

            expect(deleteExchangeCredentials).to.be.not.undefined;

        });

        it('return null if the credentials were not found', async () => {

            const result = await deleteExchangeCredentials(-1);
            expect(result).to.be.null;

        });

        it('set the api key and secret to null all of the additional params', async () => {

            const credential = await deleteExchangeCredentials(MOCK_CREDENTIAL.id);

            expect(credential.api_key_string).to.be.null;
            expect(credential.api_secret_string).to.be.null;
            expect(credential.additional_params_object.extra_1).to.be.null;
            expect(credential.additional_params_object.extra_2).to.be.null;

            expect(DUMMY_CONNECTOR.apiKey).to.be.null;
            expect(DUMMY_CONNECTOR.secret).to.be.null;
            expect(DUMMY_CONNECTOR.extra_1).to.be.null;
            expect(DUMMY_CONNECTOR.extra_2).to.be.null;

        });

    });

});

