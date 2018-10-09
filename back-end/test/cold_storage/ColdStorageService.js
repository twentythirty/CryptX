"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('ColdStorage testing', () => {

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);

            sinon.stub(sequelize, 'transaction').callsFake(callback => {
                return Promise.resolve(callback());
            });

            done();
        })
    });

    after(done => {

        sequelize.transaction.restore();

        done()
    });

    const ColdStorageService = require('./../../services/ColdStorageService');
    const ColdStorageCustodian = require('./../../models').ColdStorageCustodian;
    const ColdStorageAccount = require('./../../models').ColdStorageAccount;
    const ColdStorageTransfer = require('./../../models').ColdStorageTransfer;
    const Asset = require('./../../models').Asset;
    const sequelize = require('./../../models').sequelize;

    describe('and method createCustodian shall', () => {

        const createCustodian = ColdStorageService.createCustodian;

        const MOCK_CUSTODIAN_NAME = 'Very Testy Test LTD.';

        beforeEach(done => {
            sinon.stub(ColdStorageCustodian, 'count').callsFake(options => {
                return Promise.resolve(0);
            });
            sinon.stub(ColdStorageCustodian, 'create').callsFake(custodian_data => {
                return Promise.resolve(Object.assign({ id: _.random(false) }, custodian_data));
            });

            done();
        });

        afterEach(done => {
            ColdStorageCustodian.count.restore();
            ColdStorageCustodian.create.restore();

            done();
        });

        it('exist', () => {
            return chai.expect(createCustodian).to.be.not.undefined;
        });

        it('reject invalid arguments', () => {
            return Promise.all(_.map([
                {},
                [],
                null,
                { name: 1 }
            ], param => {
                chai.assert.isRejected(createCustodian(param));
            }));
        });

        it('reject if a custodian with the same name already exists', () => {

            ColdStorageCustodian.count.restore();
            sinon.stub(ColdStorageCustodian, 'count').callsFake(options => {
                return Promise.resolve(1);
            });

            return chai.assert.isRejected(createCustodian(MOCK_CUSTODIAN_NAME));

        });

        it('create a new custodian if the name is valid and it does not exist in the database', () => {

            return createCustodian(MOCK_CUSTODIAN_NAME).then(new_custodian => {

                chai.expect(new_custodian.id).to.be.a('number');
                chai.expect(new_custodian.name).to.equal(MOCK_CUSTODIAN_NAME);

            });

        });

    });

    describe('and method createColdStorageAccount shall', () => {

        const createColdStorageAccount = ColdStorageService.createColdStorageAccount;

        const MOCK_IDS = {
            NON_CRYPTO_ASSET: 1,
            CRYPTO_ASSET: 2,

            VALID_CUSTODIAN: 1,

            NOT_FOUND: 999
        };

        const MOCK_ADDRESS = '3h21kj4h1jk5h1';

        beforeEach(done => {

            sinon.stub(Asset, 'findById').callsFake(id => {
                switch(id) {
                    case MOCK_IDS.NON_CRYPTO_ASSET:
                        return Promise.resolve({ symbol: 'USD' });
                    case MOCK_IDS.CRYPTO_ASSET:
                        return Promise.resolve({ symbol: 'BTC' });
                    default:
                        return Promise.resolve(null);
                }
            });

            sinon.stub(ColdStorageCustodian, 'findById').callsFake(id => {
                switch(id) {
                    case MOCK_IDS.VALID_CUSTODIAN:
                        return Promise.resolve({ name: 'Duck Fury' });
                    default:
                        return Promise.resolve(null);
                }
            });

            sinon.stub(ColdStorageAccount, 'create').callsFake(data => {
                return Promise.resolve(Object.assign({ id: _.random(false) }, data));
            });

            sinon.stub(ColdStorageAccount, 'count').callsFake(() => {
                return Promise.resolve(0);
            });

            done();
        });

        afterEach(done => {
            Asset.findById.restore();
            ColdStorageCustodian.findById.restore();
            ColdStorageAccount.create.restore();
            ColdStorageAccount.count.restore();

            done();
        });

        it('exist', () => {
            return chai.expect(createColdStorageAccount).to.be.not.undefined;
        });

        it('reject invalid params', () => {
            return Promise.all(_.map([
                [],
                [1],
                [1, 1],
                [1, 2, 3],
                [1, 2, 3, '1'],
                [{}, 3, 3, '23'],
                [101, null, 2, '23123']
            ], params => {
                chai.assert.isRejected(createColdStorageAccount(...params));
            }));
        });

        it('reject if it did not find the asset', () => {
            chai.assert.isRejected(createColdStorageAccount(STRATEGY_TYPES.MCI, MOCK_IDS.NOT_FOUND, MOCK_IDS.CRYPTO_ASSET, MOCK_ADDRESS));
        });

        it('reject if found asset is not a crypto currency', () => {
            chai.assert.isRejected(createColdStorageAccount(STRATEGY_TYPES.MCI, MOCK_IDS.NON_CRYPTO_ASSET, MOCK_IDS.VALID_CUSTODIAN, MOCK_ADDRESS));
        });

        it('reject if it did not find the custodian', () => {
            chai.assert.isRejected(createColdStorageAccount(STRATEGY_TYPES.MCI, MOCK_IDS.CRYPTO_ASSET, MOCK_IDS.NOT_FOUND, MOCK_ADDRESS));
        });

        it('reject if it finds an account with the same strategy, asset and custodian', () => {
            ColdStorageAccount.count.restore();

            sinon.stub(ColdStorageAccount, 'count').callsFake(() => {
                return Promise.resolve(1);
            });

            chai.assert.isRejected(createColdStorageAccount(STRATEGY_TYPES.MCI, MOCK_IDS.CRYPTO_ASSET, MOCK_IDS.VALID_CUSTODIAN, MOCK_ADDRESS));
        });

        it('create a new cold storage account', () => {
            return createColdStorageAccount(STRATEGY_TYPES.MCI, MOCK_IDS.CRYPTO_ASSET, MOCK_IDS.VALID_CUSTODIAN, MOCK_ADDRESS).then(account => {

                chai.expect(account.id).to.be.a('number');
                chai.expect(account.strategy_type).to.equal(STRATEGY_TYPES.MCI);
                chai.expect(account.asset_id).to.equal(MOCK_IDS.CRYPTO_ASSET);
                chai.expect(account.cold_storage_custodian_id).to.equal(MOCK_IDS.VALID_CUSTODIAN);
                chai.expect(account.tag).to.be.null;

            });
        });

    });

    describe('and methode changeTransferStatus shall', () => {

        const changeTransferStatus = ColdStorageService.changeTransferStatus;

        const MOCK_TANSFER_1 = {
            id: 1,
            status: COLD_STORAGE_ORDER_STATUSES.Pending,
            save() {
                return Promise.resolve(this);
            },
            toJSON() {
                return this;
            }
        };
        const MOCK_TANSFER_2 = {
            id: 2,
            status: COLD_STORAGE_ORDER_STATUSES.Approved,
            save() {
                return Promise.resolve(this);
            },
            toJSON() {
                return this;
            }
        };
        const MOCK_TRANSFERS = [MOCK_TANSFER_1, MOCK_TANSFER_2];

        before(done => {

            sinon.stub(ColdStorageTransfer, 'findById').callsFake(id => {
                const transfer = MOCK_TRANSFERS.find(m => m.id === id);
                return Promise.resolve(transfer || null);
            });

            done();
        });

        after(done => {

            ColdStorageTransfer.findById.restore();

            done();
        });

        it('exist', () => {
            return chai.expect(changeTransferStatus).to.be.not.undefined;
        });

        it('reject if passed arguments are invalid', () => {
            return Promise.all(_.map([
                [],
                [1],
                [null, 1],
                [{}, 'a']
            ], params => {
                return chai.assert.isRejected(changeTransferStatus(...params));
            }));
        });

        it('reject if status is not in the constant list', () => {
            return chai.assert.isRejected(changeTransferStatus(MOCK_TANSFER_1.id, -1));
        });

        it('return null if it did not find the trasnfer', () => {
            return changeTransferStatus(-1, COLD_STORAGE_ORDER_STATUSES.Approved).then(transfer => {

                chai.expect(transfer).to.be.null;

            });
        });

        it('reject if you try to Approve a non Pending transfer', () => {
            return chai.assert.isRejected(changeTransferStatus(MOCK_TANSFER_2.id, COLD_STORAGE_ORDER_STATUSES.Approved));
        });

        it('change the status to Approved if the transfer is currently Pending', () => {
            return changeTransferStatus(MOCK_TANSFER_1.id, COLD_STORAGE_ORDER_STATUSES.Approved).then(transfer => {

                chai.expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Approved);

            });
        });

    });

});