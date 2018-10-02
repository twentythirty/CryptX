const {
    Given,
    When,
    Then
} = require('cucumber');
const chai = require('chai');
const {
    expect
} = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');



async function generateDeposits(status) {

    const {
        RecipeRunDetail,
        sequelize
    } = require('../../../models');

    const assets_to_deposit = await RecipeRunDetail.findAll({
        where: {
            recipe_run_id: this.current_recipe_run.id
        },
        attributes: [
            'quote_asset_id', 'target_exchange_id',
            [sequelize.fn('sum', sequelize.col('investment_percentage')), 'investment_percentage']
        ],
        group: ['quote_asset_id', 'target_exchange_id']
    });

    return assets_to_deposit.map(asset => {

        return {
            amount: status === 'Faulty' ? -1 : _.random(10, 200, true),
            asset_id: asset.quote_asset_id,
            completion_timestamp: new Date(),
            creation_timestamp: new Date(),
            depositor_user_id: World.users.depositor.id,
            fee: _.random(0.1, 2, true),
            recipe_run_id: this.current_recipe_run.id,
            status: RECIPE_RUN_DEPOSIT_STATUSES[status] || RECIPE_RUN_DEPOSIT_STATUSES.Completed,
            target_exchange_account_id: this.current_exchange_accounts.find(account => {
                return (account.asset_id === asset.quote_asset_id && account.exchange_id === asset.target_exchange_id)
            }).id
        };

    });
}


Given(/^the system has (.*) Deposits$/, async function (status) {

    const records = await generateDeposits.bind(this)(status);
    const RecipeRunDeposit = require('../../../models').RecipeRunDeposit;

    return RecipeRunDeposit.bulkCreate(records, {
        returning: true
    }).then(deposits => {

        this.current_deposits = deposits;
    });
});


Given('the system has one recipe run deposit with status Pending', async function () {

    chai.assert.isNotNull(this.current_recipe_run, 'Cant create deposits without context recipe run!');

    let deposits_records = await generateDeposits.bind(this)('Completed');

    chai.assert.isArray(deposits_records, 'Expected to generate array of deposits');
    chai.assert.isAbove(deposits_records.length, 0, 'Expected to generate at least one deposit');

    //take random record or the first one if there is only one and _.random acts badly
    let idx = _.random(0, deposits_records.length - 1, false) || 0;
    let pending_deposit = deposits_records[idx];
    console.log('idx ', idx, ' deposit ', pending_deposit);
    const RecipeRunDeposit = require('../../../models').RecipeRunDeposit;

    ['depositor_user_id', 'completion_timestamp', 'amount', 'fee'].forEach(prop_name => {
        pending_deposit[prop_name] = null;
    });
    pending_deposit.status = RECIPE_RUN_DEPOSIT_STATUSES.Pending;

    return RecipeRunDeposit.bulkCreate(deposits_records, {
        returning: true
    }).then(records => {

        this.current_recipe_run_deposits = records;
    });
});


Given(/^the recipe run deposit has amount (.*) and fee (.*)$/, async function(amount, fee) {

    chai.assert.isNotNull(this.depositService, 'Context needs to have deposit service for this step!');
    chai.assert.isNotNull(this.current_recipe_run_deposits, 'Deposits should have been generated before this step!');

    const amountNum = parseFloat(amount);
    const feeNum = parseFloat(fee);
    //pick instance directly to save values into it, otherwise might test submit for deposit, not approve
    let pending_deposit = _.find(this.current_recipe_run_deposits, deposit => deposit.status == RECIPE_RUN_DEPOSIT_STATUSES.Pending);

    pending_deposit.amount = amountNum;
    pending_deposit.fee = feeNum;

    await pending_deposit.save();
});


When('confirm recipe run deposit with provided amount and fee', async function() {

    chai.assert.isNotNull(this.depositService, 'Context needs to have deposit service for this step!');
    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit by now!');

    //confirm with OK values
    const amount = _.random(Number.EPSILON, 5, true); // amount must be > 0
    const fee = _.random(0, 1, false); //fee 0 is ok

    await this.depositService.submitDeposit(
        this.current_recipe_run_deposit.id,
        World.users.depositor.id,
        {
            deposit_management_fee: fee,
            amount
        }
    );

});

When('approve recipe run deposit', async function() {

    chai.assert.isNotNull(this.depositService, 'Context needs to have deposit service for this step!');
    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit by now!');

    const [err, result] = await to(this.depositService.approveDeposit(
        this.current_recipe_run_deposit.id,
        World.users.depositor.id
    ));

    if (err) {
        this.current_recipe_run_deposit_approve_error = err;
    }

    //fill check log id for future step
    this.check_log_id = this.current_recipe_run_deposit.id;

});

Then('the system will report error with bad values', async function() {

    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit by now!');
    chai.assert.isNotNull(this.current_recipe_run_deposit_approve_error, 'Approve action did not generate deposit error!');

    const message = this.current_recipe_run_deposit_approve_error.message;

    chai.assert.include(message, `Can't confirm deposit ${this.current_recipe_run_deposit.id} with bad`, 'message not indicative of deposit confirmation failure!');

    //error should concern deposit
    if (this.current_recipe_run_deposit.amount <= 0.0) {

        chai.assert.include(message, `amount ${this.current_recipe_run_deposit.amount}`);
    } else if (this.current_recipe_run_deposit.fee < 0.0) {

        chai.assert.include(message, `fee ${this.current_recipe_run_deposit.fee}`);
    }
});