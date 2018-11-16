'use strict';

const app = require("../../app");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const { expect, assert } = chai;
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUnified = require('../../utils/ccxtUnified');
const ccxtUtils = require('../../utils/CCXTUtils');
const { sequelize, ColdStorageTransfer } = require('../../models');
const { JOB_BODY } = require('../../jobs/approved-transfer-withdraw');

describe('Approved Cold Storage Transfer withdraw job:', () => {

    const stub_config = {
        models: {
            sequelize,
            ColdStorageTransfer
        }
    };

    before(done => {
        app.dbPromise.then(migrations => {
          console.log('Migrations: %o', migrations);
    
          done();
          });
    });

    const EXTERNAL_IDENTIFIER = _.random(1, 200);
    const MOCK_BALANCE = _.random(100, 1000);
    const MOCK_FEE = _.random(1, 10);

    const TRANSFER_BASE = {
        status: COLD_STORAGE_ORDER_STATUSES.Approved,
        amount: MOCK_BALANCE + _.random(1, 5),
        placed_timestamp: null,
        completed_timestamp: null,
        address: '2h31jk3h41jk23h41jk23h41j2',
        tag: '212323',
        toJSON() {
            return this;
        },
        getDataValue(field){
            return this[field];
        },
        async save() {
            return this;
        },
        setAmount: ColdStorageTransfer.prototype.setAmount
    };

    const TRANSFER_DATA = [
        _.assign({
            id: 1,
            asset: 'BTC',
            exchange_id: 1,
            exchange_name: 'Binance',
            exchange_api_id: 'binance'            
        }, TRANSFER_BASE),
        _.assign({
            id: 2,
            asset: 'ETH',
            exchange_id: 1,
            exchange_name: 'Binance',
            exchange_api_id: 'binance'            
        }, TRANSFER_BASE),
        _.assign({
            id: 3,
            asset: 'BTC',
            exchange_id: 1,
            exchange_name: 'Bitfinex',
            exchange_api_id: 'bitfinex'            
        }, TRANSFER_BASE),
        _.assign({
            id: 4,
            asset: 'ETH',
            exchange_id: 1,
            exchange_name: 'Bitfinex',
            exchange_api_id: 'bitfinex'            
        }, TRANSFER_BASE),
        _.assign({
            id: 5,
            asset: 'BTC',
            exchange_id: 1,
            exchange_name: 'OKEx',
            exchange_api_id: 'okex'            
        }, TRANSFER_BASE),
        _.assign({
            id: 6,
            asset: 'ETH',
            exchange_id: 1,
            exchange_name: 'OKEx',
            exchange_api_id: 'okex'            
        }, TRANSFER_BASE)
    ];

    const stub_connectors = (will_fail = false, zero_balance = false) => {

        sinon.stub(ccxtUnified, 'getExchange').callsFake(async exchange_api_id => {

            class StubExchange {

                constructor() {
                    this.api_id = exchange_api_id;

                    this._connector = {
                        
                        async fetchBalance() {
                            let free = {};
                            for(let transfer of TRANSFER_DATA) free[transfer.asset] = zero_balance ? 0 : MOCK_BALANCE;
                            return { free };
                        },

                        async fetchFundingFees() {
                            let withdraw = {};
                            for(let transfer of TRANSFER_DATA) withdraw[transfer.asset] = MOCK_FEE;
                            return { withdraw };
                        }

                    }
                }

                async isReady() {
                    return true;
                }

                async withdraw(transfer) {

                    if(will_fail) throw new Error('Generic error about withdraw not working');

                    return {
                        info: {},
                        id: EXTERNAL_IDENTIFIER
                    }

                }

                async transferFunds() {
                    return true;
                }

            };

            return new StubExchange();

        });

    };

    beforeEach(done => {

        sinon.stub(sequelize, 'query').callsFake(async () => {
    
            return TRANSFER_DATA;
    
        });
    
        sinon.stub(ColdStorageTransfer, 'update').callsFake(async (update) => {
    
            return update;
    
        });

        sinon.stub(ccxtUtils, 'getThrottle').callsFake(id => {
            const throttle = {
                throttled: (d, fn, ...args) => Promise.resolve(fn(...args)),
                throttledUnhandled: (fn, ...args) => Promise.resolve(fn(...args))
            }

            return Promise.resolve(throttle);
        });

        done();

    });

    afterEach(done => {

        sequelize.query.restore();
        ColdStorageTransfer.update.restore();
        ccxtUtils.getThrottle.restore();
        if(ccxtUnified.getExchange.restore) ccxtUnified.getExchange.restore();

        done();

    });

    it('shall mark the transfers as failed if the balance will be 0', async () => {

        stub_connectors(false, true);

        let result = await JOB_BODY(stub_config, console.log);

        result = _.flatten(result).filter(r => r);
        
        expect(result).length(TRANSFER_DATA.length);

        for(let transfer of result) {

            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Failed);
            expect(transfer.placed_timestamp).to.be.null;
            expect(transfer.fee).to.equal(MOCK_FEE);
            expect(transfer.completed_timestamp).to.be.null;
            expect(transfer.external_identifier).to.be.undefined;

        }

    });

    it('shall mark the transfers as failed if the withdraw fails', async () => {

        stub_connectors(true);

        let result = await JOB_BODY(stub_config, console.log);

        result = _.flatten(result).filter(r => r);
        
        expect(result).length(TRANSFER_DATA.length);

        for(let transfer of result) {

            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Failed);
            expect(transfer.placed_timestamp).to.be.null;
            expect(transfer.fee).to.equal(MOCK_FEE);
            expect(transfer.completed_timestamp).to.be.null;
            expect(transfer.external_identifier).to.be.undefined;

        }

    });

    it('shall clamp the amount, fetch the fee and update the status and amounts correctly', async () => {

        stub_connectors(false);

        let result = await JOB_BODY(stub_config, console.log);

        result = _.flatten(result).filter(r => r);
        
        expect(result).length(TRANSFER_DATA.length);

        for(let transfer of result) {

            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Sent);
            expect(transfer.placed_timestamp).to.be.a('number');
            expect(transfer.fee).to.equal(MOCK_FEE);
            expect(transfer.amount).to.equal(MOCK_BALANCE);
            expect(transfer.completed_timestamp).to.be.null;
            expect(transfer.external_identifier).to.be.not.undefined;

        }

    });

});