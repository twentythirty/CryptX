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

        it('reject if parsed areguments are not valid', () => {
            return Promise.all(_.map([
                [],
                [{}],
                ['12321', null],
                ['21323', { relations: 13123 }],
                ['23123', { user: '12313' }],
                ['123131', { relations: { invalid_user_id: 123 } }]
            ], params => {
                chai.assert.isRejected(log(...params));
            }));
        });

        it('log an ction if the parameters match', () => {
            const   user_id = 1,
                    asset_id = 4,
                    exchange_id = 5;

            return log('31h2j132hkj3h', {
                user: {
                    id: user_id,
                    session: true
                },
                relations: [ { asset_id }, { exchange_id } ]
            }).then(action => {

                chai.expect(action).to.an('object');

                chai.expect(action.id).to.be.a('number');
                chai.expect(action.timestamp).to.be.a('date');
                chai.expect(action.user_session_id).to.equal(user_id);
                chai.expect(action.performing_user_id).to.equal(user_id);
                chai.expect(action.asset_id).to.equal(asset_id);
                chai.expect(action.exchange_id).to.equal(exchange_id);

                chai.expect(action.exchange_account_id).to.be.null;
                chai.expect(action.execution_order_id).to.be.null;
                chai.expect(action.instrument_id).to.be.null;
                chai.expect(action.investment_run_id).to.be.null;
                chai.expect(action.recipe_order_id).to.be.null;
                chai.expect(action.recipe_run_deposit_id).to.be.null;
                chai.expect(action.recipe_run_id).to.be.null;
                chai.expect(action.role_id).to.be.null;
                chai.expect(action.user_id).to.be.null;

            });
        });

    });

});