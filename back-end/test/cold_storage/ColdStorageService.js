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

            //sinon.stub(ActionLogUtil, 'logAction').callsFake(() => {return;});

            done();
        })
    });

    const ColdStorageService = require('./../../services/ColdStorageService');
    const ColdStorageCustodian = require('./../../models').ColdStorageCustodian;

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

});