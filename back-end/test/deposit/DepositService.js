"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('DepositService testing', () => {

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);
            done();
        })
    });

    const DepositService = require('./../../services/DepositService');
    const RecipeRunDeposit = require('./../../models').RecipeRunDeposit;

    describe('and method approveDeosit shall', () => {

        const { Pending, Completed } = MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES;

        const MOCK_BASE_DEPOSIT = {
            id: 1,
            creation_timestamp: new Date(),
            recipe_run_id: 1,
            amount: null,
            depositor_user_id: null,
            completion_timestamp: null,
            target_exchange_account_id: 45,
            status: 150,
            asset_id: 24,
            fee: null,
            save() { return Promise.resolve(this) }
        };

        before(done => {

            sinon.stub(RecipeRunDeposit, 'findById').callsFake(deposit_id => {
                switch(deposit_id) {
                    case 1:
                        return Promise.resolve(Object.assign({}, MOCK_BASE_DEPOSIT, {
                            status: 151,
                        }));
                    case 2:
                        return Promise.resolve(Object.assign({}, MOCK_BASE_DEPOSIT));
                    default: 
                        return Promise.resolve(null);
                }
            });

            done();

        });

        after(done => {

            RecipeRunDeposit.findById.restore();
            done();

        });

        it('exist', () => {
            chai.expect(DepositService.approveDeposit).to.not.be.undefined;
        });

        it('reject if the required arguments are missing or invalid', () => {
            return Promise.all(_.map([
                {},
                { amount: 1 },
                { deposit_management_fee: 1 },
                { deposit_management_fee: -1, amount: 2 },
                { deposit_management_fee: 45, amount: 'fg' }
            ], params => {
                chai.assert.isRejected(DepositService.approveDeposit(2, 1, params));
            }))
        });

        it('reject if the deposit status is not Pending', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return chai.assert.isRejected(DepositService.approveDeposit(1, 1, valid_update));
        });

        it('resolve in a null when a deposit is not found at all', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };

            return DepositService.approveDeposit(999, 1, valid_update).then(deposit => {
                chai.expect(deposit).to.be.null;
            });
        });

        it('approve a Pending deposit and update it appropriately', () => {
            const valid_update = { deposit_management_fee: 45.123123, amount: 21.31231 };
            const user_id = 1

            return DepositService.approveDeposit(2, user_id, valid_update).then(deposit => {

                chai.expect(deposit).to.be.an('object');
                chai.expect(deposit.status).to.equal(MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Completed);
                chai.expect(deposit.fee).to.equal(valid_update.deposit_management_fee);
                chai.expect(deposit.amount).to.equal(valid_update.amount);
                chai.expect(deposit.depositor_user_id).to.equal(user_id);
                chai.expect(deposit.completion_timestamp).to.a('date');

            });
        });

    });

});