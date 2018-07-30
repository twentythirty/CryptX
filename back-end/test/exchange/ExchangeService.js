"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

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

    describe('and method createExchangeAccount shall', () => {

        const { Trading, Withdrawal } = MODEL_CONST.EXCHANGE_ACCOUNT_TYPES

        before(done => {

            sinon.stub(Asset, 'count').callsFake(options => {
                const asset_id = options.where.id;

                switch (asset_id) {
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
            Asset.count.restore();
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
            return chai.assert.isRejected(ExchangeService.createExchangeAccount(Trading, 2, 1, '111'));
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

});

