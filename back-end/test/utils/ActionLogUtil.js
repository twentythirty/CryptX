"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('ActionLogUtil testing', () => {

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);

            sinon.stub(ActionLog, 'create').callsFake(action => {
                const new_action = Object.assign({}, MOCK_BASE_ACTION, { id: _.random(false) }, action);
                return Promise.resolve(new_action);
            });

            sinon.stub(UserSession, 'findOne').callsFake(options => {
                const user_id = options.where.user_id;

                const valid_ids = [1, 2, 3, 4, 5];

                if(valid_ids.includes(user_id)) {
                    return Promise.resolve({
                        id: user_id,
                        user_id: user_id
                    });
                }
                else return Promise.resolve(null);
            })

            done();
        })
    });

    after(done => {

        ActionLog.create.restore();
        UserSession.findOne.restore();

        done();

    });

    const ActionLogUtil = require('./../../utils/ActionLogUtil');
    const ActionLog = require('./../../models').ActionLog;
    const UserSession = require('./../../models').UserSession;

    const MOCK_BASE_ACTION = {
        id: 1,
        timestamp: new Date(),
        performing_user_id: null,
        user_session_id: null,
        asset_id: null,
        exchange_account_id: null,
        exchange_id: null,
        execution_order_id: null,
        instrument_id: null,
        investment_run_id: null,
        recipe_order_id: null,
        recipe_run_deposit_id: null,
        recipe_run_id: null,
        role_id: null,
        user_id: null
    };

    describe('and the method "log" shall', () => {

        const log = ActionLogUtil.log;

        it('exists', () => {
            chai.expect(log).to.not.undefined;
        });

        it('log an action', () => {
            const   asset_id = 4,
                    exchange_id = 5;

            return log('31h2j132hkj3h', {
                relations: [ { asset_id }, { exchange_id } ]
            }).then(action => {
                chai.expect(ActionLog.create.calledOnce).to.be.true;
            });
        });

    });

});