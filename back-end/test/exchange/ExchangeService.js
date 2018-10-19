"use strict";

const app = require("../../app");
const chai = require("chai");
const asPromised = require('chai-as-promised');
const should = chai.should();
const sinon = require("sinon");

const { expect, assert } = chai;

chai.use(asPromised);

describe('ExchangeService testing', () => {

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);
            done();
        })
    });

    const ExchangeService = require('./../../services/ExchangeService');
    const Asset = require('./../../models').Asset;
    const Exchange = require('./../../models').Exchange;
    const ExchangeAccount = require('./../../models').ExchangeAccount;
    const InstrumentExchangeMapping = require('./../../models').InstrumentExchangeMapping;
    const InvestmentRun = require('./../../models').InvestmentRun;

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

});

