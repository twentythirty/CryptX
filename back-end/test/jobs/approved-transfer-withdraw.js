'use strict';

const app = require("../../app");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const { expect, assert } = chai;
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUnified = require('../../utils/ccxtUnified');
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

    const TRANSFER_BASE = {
        status: COLD_STORAGE_ORDER_STATUSES.Approved,
        amount: _.random(100, 1000),
        placed_timestamp: null,
        completed_timestamp: null,
        address: '2h31jk3h41jk23h41jk23h41j2',
        tag: '212323',
        toJSON() {
            return this;
        }
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

    const stub_connectors = (will_fail = false) => {

        sinon.stub(ccxtUnified, 'getExchange').callsFake(async exchange_api_id => {

            class StubExchange {

                constructor() {
                    this.api_id = exchange_api_id;
                }

                async isReady() {
                    return true;
                }

                async withdraw(symbol, amount, address, tag = null) {

                    if(will_fail) throw new Error('Generic error about withdraw not working');

                    if(
                        !symbol || !amount || !address
                    ) throw new Error('Required params were not passed');

                    return {
                        info: {},
                        id: EXTERNAL_IDENTIFIER
                    }

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

        done();

    });

    afterEach(done => {

        sequelize.query.restore();
        ColdStorageTransfer.update.restore();
        if(ccxtUnified.getExchange.restore) ccxtUnified.getExchange.restore();

        done();

    });

    it('shall mark the transfers as failed if the withdraw fails', async () => {

        stub_connectors(true);

        await JOB_BODY(stub_config, console.log);

        const callCount = ColdStorageTransfer.update.callCount;
        expect(callCount).to.equal(TRANSFER_DATA.length * 2);

        for(let i = 0; i < callCount; i++) {

            const [ update, options ] = ColdStorageTransfer.update.args[i];

            if(i < callCount / 2) {

                expect(update.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Sent);
                expect(TRANSFER_DATA.map(t => t.id)).include(options.where.id);

            }

            else {

                expect(update.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Failed);
                expect(update.placed_timestamp).to.be.null;
                expect(update.completed_timestamp).to.be.undefined;
                expect(update.external_identifier).to.be.undefined;
                expect(TRANSFER_DATA.map(t => t.id)).include(options.where.id);

            }

        }

    });

    it('shall call the correnct amount of methods and params on successful withdraws', async () => {

        stub_connectors(false);

        await JOB_BODY(stub_config, console.log);

        const callCount = ColdStorageTransfer.update.callCount;
        expect(callCount).to.equal(TRANSFER_DATA.length * 2);

        for(let i = 0; i < callCount; i++) {

            const [ update, options ] = ColdStorageTransfer.update.args[i];

            if(i < callCount/2) {
                expect(update.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Sent);
                expect(TRANSFER_DATA.map(t => t.id)).include(options.where.id);
                expect(update.placed_timestamp).to.be.a('number');
                expect(update.completed_timestamp).to.be.undefined;
            }
            else {
                expect(update.external_identifier).to.be.not.null.and.to.be.not.undefined;
                expect(update.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Sent);
            }
            

        }

    });

});