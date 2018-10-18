'use strict';

const app = require("../../app");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const { expect, assert } = chai;
const sinon = require("sinon");

chai.use(chaiAsPromised);

const { sequelize, AssetStatusChange } = require('../../models');
const { JOB_BODY } = require('../../jobs/asset-price-age-checker');

describe('Asset price age checker job:', () => {

    const STUB_CONFIG = {
        models: { sequelize, AssetStatusChange }
    };

    const MOCK_ASSETS = [
        {
            id: 1,
            symbol: 'DOGE',
            long_name: 'DOgeCoin',
            price_old_enough: true
        },
        {
            id: 1,
            symbol: 'DOGE',
            long_name: 'DOgeCoin',
            price_old_enough: false
        },
        {
            id: 2,
            symbol: 'XRP',
            long_name: 'Stellar',
            price_old_enough: false
        },
        {
            id: 2,
            symbol: 'XRP',
            long_name: 'Stellar',
            price_old_enough: false
        },
        {
            id: 3,
            symbol: '$$$',
            long_name: 'Money',
            price_old_enough: false
        },
        {
            id: 4,
            symbol: '1ST',
            long_name: 'First Kill',
            price_old_enough: true
        }
    ];

    beforeEach(done => {

        sinon.stub(sequelize, 'query').callsFake(async () => {

            return MOCK_ASSETS;

        });

        sinon.stub(AssetStatusChange, 'bulkCreate').callsFake(async inserts => {

            let id = 1;
            return inserts.map(i => Object.assign({ id: id++ }, i));

        });

        done();
    });

    afterEach(done => {

        sequelize.query.restore();
        AssetStatusChange.bulkCreate.restore();

        done();
    });

    it('greylist assets which don\'t meet the price age on all instruments or don\'t have instruments', async () => {

        await JOB_BODY(STUB_CONFIG, console.log);

        const inserts = _.flattenDepth(AssetStatusChange.bulkCreate.args, 2);

        for(let insert of inserts) {

            expect([2, 3]).includes(insert.asset_id);
            expect(insert.type).to.equal(INSTRUMENT_STATUS_CHANGES.Graylisting);
            expect(insert.comment).to.equal('Pricing data is not old enough');

        }

    });

});