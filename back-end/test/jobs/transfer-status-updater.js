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
const { JOB_BODY } = require('../../jobs/transfer-status-updater');

describe('Cold storage transfer status updater job:', () => {

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
        status: COLD_STORAGE_ORDER_STATUSES.Sent,
        amount: _.random(100, 1000),
        placed_timestamp: Date.now(),
        completed_timestamp: null,
        address: '2h31jk3h41jk23h41jk23h41j2',
        tag: '212323',
        async save() {
            return this;
        },
        changed() {
            return true;
        },
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
            'dataValues.exchange_api_id': 'binance',
            external_identifier: 1            
        }, TRANSFER_BASE),
        _.assign({
            id: 2,
            asset: 'ETH',
            exchange_id: 1,
            exchange_name: 'Binance',
            'dataValues.exchange_api_id': 'binance',
            external_identifier: 2             
        }, TRANSFER_BASE),
        _.assign({
            id: 3,
            asset: 'BTC',
            exchange_id: 1,
            exchange_name: 'Bitfinex',
            'dataValues.exchange_api_id': 'bitfinex',
            external_identifier: 3             
        }, TRANSFER_BASE),
        _.assign({
            id: 4,
            asset: 'ETH',
            exchange_id: 1,
            exchange_name: 'Bitfinex',
            'dataValues.exchange_api_id': 'bitfinex',
            external_identifier: 4             
        }, TRANSFER_BASE),
        _.assign({
            id: 5,
            asset: 'BTC',
            exchange_id: 1,
            exchange_name: 'OKEx',
            'dataValues.exchange_api_id': 'okex',
            external_identifier: 5             
        }, TRANSFER_BASE),
        _.assign({
            id: 6,
            asset: 'ETH',
            exchange_id: 1,
            exchange_name: 'OKEx',
            'dataValues.exchange_api_id': 'okex',
            external_identifier: 6             
        }, TRANSFER_BASE)
    ];

    const stub_connectors = (status = 'pending') => {

        sinon.stub(ccxtUnified, 'getExchange').callsFake(exchange_api_id => {

            return class StubExchange {

                constructor() {
                    this.api_id = exchange_api_id;
                }

                async isReady() {
                    return true;
                }

                async fetchWithdraws(transfers) {

                    return transfers.map(transfer => {

                        return {
                            id: transfer.external_identifier,
                            amount: transfer.amount,
                            status,
                            fee: {
                                cost: _.random(0.0001, 0.00001, true)
                            },
                            timestamp: Date.now()
                        };

                    });

                }

            }

        });

    };

    beforeEach(done => {

        sinon.stub(sequelize, 'query').callsFake(async () => {
            
            return TRANSFER_DATA.map(D => Object.assign({}, D));
    
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

    it('shall keep the transfers unchanged if their status is "pending", except for the fee', async () => {

        stub_connectors('pending');

        const result = await JOB_BODY(stub_config, console.log);
        const transfers = _.flatten(result);

        for(let transfer of transfers) {

            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Sent);
            expect(transfer.completed_timestamp).to.be.null;
            expect(transfer.fee).to.be.a('number');

        }
        
    });

    it('shall mark the transfers as Failed if the withdraw status is "failed"', async () => {

        stub_connectors('failed');

        const result = await JOB_BODY(stub_config, console.log);
        const transfers = _.flatten(result);

        for(let transfer of transfers) {

            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Failed);
            expect(transfer.completed_timestamp).to.be.null;

        }

    });

    it('shall mark the transfers as Completed if the withdraw status is "ok"', async () => {

        stub_connectors('ok');

        const result = await JOB_BODY(stub_config, console.log);
        const transfers = _.flatten(result);

        for(let transfer of transfers) {

            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Completed);
            expect(transfer.completed_timestamp).to.be.a('date');

        }

    });

});