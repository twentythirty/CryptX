'use strict';

const app = require("../../app");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const { expect, assert } = chai;
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUtils = require('../../utils/CCXTUtils');
const { sequelize, ColdStorageTransfer, ColdStorageAccount } = require('../../models');
const { JOB_BODY } = require('../../jobs/cold-storage-transfers-generator');

describe('Cold storage transfer generator job:', () => {

    const stub_config = {
        models: {
            sequelize,
            ColdStorageTransfer,
            ColdStorageAccount
        }
    };

    before(done => {
        app.dbPromise.then(migrations => {
          console.log('Migrations: %o', migrations);
    
          done();
          });
    });

    const MOCK_ASSETS = [{
        id: 1,
        symbol: 'BTC'
    },{
        id: 2,
        symbol: 'XRP'
    },{
        id: 3,
        symbol: 'DOGE'
    },{
        id: 4,
        symbol: 'EOS'
    },{
        id: 5,
        symbol: 'ADA'
    }];

    const MOCK_BALANCE = _.random(100, 1000);
    const MOCK_FEE = _.random(1, 10);
    const MOCK_RECIPE_RUN_ID = _.random(1, 99);

    const MOCK_EXCHANGE = {
        id: 'test-coin',
        async fetchFundingFees() {
            let withdraw = {};
            for(let asset of MOCK_ASSETS) withdraw[asset.symbol] = MOCK_FEE;
            return { withdraw };
        }
    };

    const BASE_ORDER = {
        strategy_type: STRATEGY_TYPES.LCI,
        status: RECIPE_ORDER_STATUSES.Completed,
        price: _.random(0.01, 0.001, true),
        target_exchange_id: 1,
        side: ORDER_SIDES.Buy,
        quantity: MOCK_BALANCE + _.random(1, 10),
        recipe_run_id: MOCK_RECIPE_RUN_ID,
        cold_storage_account_id: 1
    };
    const MOCK_ORDERS = [];

    for(let i = 1; i <= 18; i++) MOCK_ORDERS.push(_.assign({
        id: i,
        transaction_asset_id: MOCK_ASSETS[i % MOCK_ASSETS.length].id,
        asset: MOCK_ASSETS[i%MOCK_ASSETS.length].symbol,
        recipe_order_group_id: (i % 3) + 1
    }, BASE_ORDER));

    const MOCK_CT_ACCOUNTS = _.uniqBy(MOCK_ORDERS, 'transaction_asset_id').map(order => {
        return {
            asset_id: order.transaction_asset_id,
            strategy_type: order.strategy_type
        };
    });

    beforeEach(done => {

        sinon.stub(ccxtUtils, 'getConnector').callsFake(async id => {
            return MOCK_EXCHANGE;
        });

        sinon.stub(sequelize, 'query').callsFake(async query => {
            return MOCK_ORDERS;
        });

        sinon.stub(ColdStorageAccount, 'findAll').callsFake(async options => {
            return MOCK_CT_ACCOUNTS;
        });

        sinon.stub(ColdStorageTransfer, 'bulkCreate').callsFake(async records => {
            return records;
        });

        done();
    });

    afterEach(done => {

        ccxtUtils.getConnector.restore();
        sequelize.query.restore();
        ColdStorageAccount.findAll.restore();
        ColdStorageTransfer.bulkCreate.restore();

        done();
    });

    it('shall not create transfers if there were no complete order groups', async () => {

        sequelize.query.restore();
        sinon.stub(sequelize, 'query').callsFake(async query => {
            return [];
        });

        const result = await JOB_BODY(stub_config, console.log);

        expect(result).to.be.an('array');
        expect(result).length(0);

    });

    it('shall not create transfers if there are missing cold storage accounts', async () => {

        sequelize.query.restore();
        sinon.stub(sequelize, 'query').callsFake(async query => {
            return MOCK_ORDERS.map(o => {
                return _.assign({}, o, { cold_storage_account_id: null })
            });
        });

        const result = await JOB_BODY(stub_config, console.log);

        expect(result).to.be.an('array');
        expect(result).length(0);

    });
    /*
    it('shall not create transfers if the balance on the exchange is 0', async () => {
        
        ccxtUnified.getExchange.restore();
        sinon.stub(ccxtUnified, 'getExchange').callsFake(async id => {
            return {id: 'test-coin',
                _connector: {
                    async fetchBalance(){
                        let free = {};
                        for(let asset of MOCK_ASSETS) free[asset.symbol] = 0;
                        return { free };
                    }
                },
                async fetchFundingFees() {
                    let withdraw = {};
                    for(let asset of MOCK_ASSETS) withdraw[asset.symbol] = 0;
                    return { withdraw };
                }
            };
        });

        const result = await JOB_BODY(stub_config, console.log);

        expect(result).to.be.an('array');
        expect(result).length(0);

    });
    */
    it('shall create a transfer for each order', async () => {

        const transfers = await JOB_BODY(stub_config, console.log);

        expect(transfers).length(MOCK_ORDERS.length);
        
        for(let transfer of transfers) {

            const matching_order = MOCK_ORDERS.find(o => o.id === transfer.recipe_run_order_id);

            expect(matching_order).to.be.not.undefined;
            expect(transfer.recipe_run_id).to.equal(MOCK_RECIPE_RUN_ID);
            expect(transfer.amount).to.equal(BASE_ORDER.quantity);
            expect(transfer.fee).to.equal(MOCK_FEE);
            expect(transfer.asset_id).to.equal(matching_order.transaction_asset_id);
            expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES.Pending);

        }

    });

});