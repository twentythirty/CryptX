'use_strict';

let chai = require("chai");
let should = chai.should();
const sinon = require('sinon');
const Exchange = require('../../models').Exchange;
const app = require('../../app');
const CCXTUtils = require('../../utils/CCXTUtils');

describe('CCXTUtils', () => {

    let test_exchange;
    let test_connector;

    before(done => {

        app.dbPromise.then(migrations => {
            
            return Exchange.findOne();
        }).then(exchange => {

            test_exchange = exchange;

            done();
        });
    });


    it('shall export a function to get a ccxt connector', () => {
        
        //the way chai is build you cant test if this is a promise wihtout hacks
        chai.expect(CCXTUtils.getConnector).to.exist;
    });

    it('shall return the same exchange for all valid argument types', done => {

        CCXTUtils.getConnector(test_exchange.api_id).then(connector => {

            chai.expect(connector).to.not.be.null;
            test_connector = connector;

            return CCXTUtils.getConnector(test_exchange.id);
        }).then(connector => {

            chai.expect(connector).to.eq(test_connector);

            return CCXTUtils.getConnector(test_exchange)
        }).then(connector => {

            chai.expect(connector).to.eq(test_connector);

            done();
        });
    });

});