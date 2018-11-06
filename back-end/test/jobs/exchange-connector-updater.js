'use strict';

const app = require("../../app");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const { expect, assert } = chai;
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxtUtils = require('../../utils/CCXTUtils');
const { sequelize, Exchange, ExchangeCredential } = require('../../models');
const { JOB_BODY } = require('../../jobs/exchange-connector-updater');

describe('Exchange connector updater job:', () => {

    const stub_config = {
        models: {
            sequelize,
            Exchange,
            ExchangeCredential
        }
    };

    const STUB_CREDENTIAL = {
        id: 1,
        exchange_id: 1,
        Exchange: {
            id: 1,
            name: 'OKEX',
            api_id: 'okex'
        },
        api_key_string: '2jk4h3j4h23jkh42j3h42k',
        api_secret_string: '2jk43h2j4h2j3h42jh34jkh2jk34h',
        additional_params_object: {
            password: '123354544446859999'
        },
        async save() {
            return Object.assign({}, this);
        },
        updated: true
    };

    const STUB_CONNECTOR = {
        id: 1,
        apiKey: null,
        secret: null,
        password: null
    };

    beforeEach(done => {

        sinon.stub(ccxtUtils, 'getConnector').callsFake(async api_id => {
            return STUB_CONNECTOR;
        });

        sinon.stub(ExchangeCredential, 'findAll').callsFake(async options => {
            return [ STUB_CREDENTIAL ];
        });

        done();
    });

    afterEach(done => {

        ccxtUtils.getConnector.restore();
        ExchangeCredential.findAll.restore();

        done();
    });

    it('update the credentials and mark the exchanged credentials in the db as not updated', async () => {

        await JOB_BODY(stub_config, console.log);

        expect(STUB_CONNECTOR.apiKey).to.equal(STUB_CREDENTIAL.api_key_string);
        expect(STUB_CONNECTOR.secret).to.equal(STUB_CREDENTIAL.api_secret_string);
        expect(STUB_CONNECTOR.password).to.equal(STUB_CREDENTIAL.additional_params_object.password);

        expect(STUB_CREDENTIAL.updated).to.be.false;

    });

});