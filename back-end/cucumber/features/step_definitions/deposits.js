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

Given('the system has one recipe run deposit with valid amount and fee', async function() {

    const records = await generateDeposits.bind(this)('Completed');
    const RecipeRunDeposit = require('../../../models').RecipeRunDeposit;

    //all these depoits will have valid amount/fee, so it fits this stepp
    return RecipeRunDeposit.bulkCreate(records, {
        returning: true
    }).then(deposits => {

        this.current_recipe_run_deposits = deposits;
    });
});

Given('the recipe run deposit has status Completed', async function() {

    //ensure status in this step is completed
    chai.assert.isNotNull(this.depositService, 'Context needs to have deposit service for this step!');
    chai.assert.isNotNull(this.current_recipe_run_deposits, 'Deposits should have been generated before this step!');

    const completed_deposit = _.find(this.current_recipe_run_deposits, deposit => deposit.status == RECIPE_RUN_DEPOSIT_STATUSES.Completed);

    //none of the deposits are completed
    if (completed_deposit == null) {
        let first_deposit = _.first(this.current_recipe_run_deposits);

        first_deposit.status = RECIPE_RUN_DEPOSIT_STATUSES.Completed;
        await first_deposit.save()
    }
});

Given('the system has some recipe run deposits with status Pending', async function() {

    chai.assert.isNotNull(this.current_recipe_run, 'Cant create deposits without context recipe run!');

    let deposits_records = await generateDeposits.bind(this)('Pending');

    chai.assert.isArray(deposits_records, 'Expected to generate array of deposits');
    chai.assert.isAbove(deposits_records.length, 1, 'Expected to generate more than one Pending deposit');

    const null_for_pending = ['depositor_user_id', 'completion_timestamp', 'amount', 'fee'];
    _.forEach(deposits_records, record => {
        _.forEach(null_for_pending, prop_name => {
            record[prop_name] = null;
        })
    });
    const RecipeRunDeposit = require('../../../models').RecipeRunDeposit;

    return RecipeRunDeposit.bulkCreate(deposits_records, {
        returning: true
    }).then(records => {

        this.current_recipe_run_deposits = records;
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

Given('the Recipe Run Deposits are as followed:', async function(table) {

    const { RecipeRunDeposit, Asset, Exchange, ExchangeAccount, sequelize } = require('../../../models');

    const [ base_assets, exchanges ] = await Promise.all([
        Asset.findAll({ where: { is_base: true } }),
        Exchange.findAll()
    ]);

    let deposits = table.hashes();

    deposits = await Promise.all(deposits.map(async deposit => {
        const base_asset = base_assets.find(a => a.symbol === deposit.asset)
        expect(base_asset, `Expected to find base Asset ${deposit.asset}`).to.be.not.undefined;

        const exchange = exchanges.find(e => e.name === deposit.exchange);
        expect(exchange, `Expected to find Exchnage ${deposit.exchange}`).to.be.not.undefined;

        const exchange_account = await ExchangeAccount.findOne({
            where: {
                exchange_id: exchange.id,
                asset_id: base_asset.id
            }
        });
        expect(exchange_account, `Expected to find Exchange account ${exchange.name}/${base_asset.symbol} `).to.be.not.null;

        return {
            amount: deposit.amount,
            asset_id: base_asset.id,
            target_exchange_account_id: exchange_account.id,
            fee: deposit.fee,
            status: RECIPE_RUN_DEPOSIT_STATUSES[deposit.status],
            depositor_user_id: World.users.depositor.id,
            recipe_run_id: this.current_recipe_run.id,
            creation_timestamp: Date.now(),
            completion_timestamp: deposit.status === 'Compelted' ? Date.now() : null
        };
    }));
    
    return sequelize.transaction(async transaction => {

        await RecipeRunDeposit.destroy({
            where: { recipe_run_id: this.current_recipe_run.id }
        }, { transaction });

        return RecipeRunDeposit.bulkCreate(deposits, { transaction });

    });

});

async function adjust_deposit_values(recipe_run_deposit_id, depositor_user, amount = _.random(Number.EPSILON, 5, true), fee = _.random(0, 1, false)) {

    chai.assert.isDefined(this.depositService, 'Context needs to have deposit service for this step!');
    chai.assert.isNotNull(recipe_run_deposit_id, 'Provided reciep run deposit id is null');
    chai.assert.isNotNull(depositor_user, 'Provided depositor user is null');
    chai.assert.isNumber(amount, 'Provided amount is not a number: ' + amount);
    chai.assert.isNumber(fee, 'Provided fee is not a number: ' + fee);

    const [err, results] = await to(this.depositService.submitDeposit(
        recipe_run_deposit_id,
        depositor_user,
        {
            deposit_management_fee: fee,
            amount
        }
    ));

    return { err, results }
}

When('confirm recipe run deposit with provided amount and fee', async function() {

    chai.assert.isNotNull(this.depositService, 'Context needs to have deposit service for this step!');
    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit by now!');

    await adjust_deposit_values.bind(this)(this.current_recipe_run_deposit.id, World.users.depositor);
});

When(/confirm recipe run deposit with amount (.*) and fee (.*)/, async function(deposit_amount_text, deposit_fee_text) {

    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit for this step!');
    chai.assert.isNotNull(this.current_user, 'Context needs to have current user for this step');
    const deposit_amount = parseFloat(deposit_amount_text);
    chai.assert.isNumber(deposit_amount, `Provided deposit_amount text ${deposit_amount_text} did not resolve to a number!`);
    const deposit_fee = parseFloat(deposit_fee_text);
    chai.assert.isNumber(deposit_fee, `Provided deposit_fee text ${deposit_fee_text} did not resolve to a number!`);

    const { err, results } = await adjust_deposit_values.bind(this)(
        this.current_recipe_run_deposit.id, 
        this.current_user,
        deposit_amount,
        deposit_fee)
    chai.assert.isNull(err, `Adjusting deposit should not have produced an error: ${JSON.stringify(err)}`);
    //refresh deposit info 
    this.current_recipe_run_deposit = results.updated_deposit;
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
    //save prev investmetn run state due to possible status change
    this.prev_investment_run = this.current_investment_run;
    this.current_investment_run = await require('../../../models').InvestmentRun.findById(this.current_investment_run.id);
    //fill check log id for future step
    this.check_log_id = this.current_recipe_run_deposit.id;

});

Then('there are no deposit log entries', async function() {

    chai.assert.isDefined(this.current_recipe_run_deposit, 'Context needs to have recipe run deposit for this step!');

    const deposit_logs = await require('../../../models').ActionLog.findAll({
        where: { recipe_run_deposit_id: this.current_recipe_run_deposit.id },
        attributes: ['id', 'details', 'timestamp', 'level', 'translation_key', 'translation_args'],
        order: [ [ 'timestamp', 'DESC' ] ]
    })

    chai.assert.equal(deposit_logs.length, 0, `Deposit logs array for deposit ${this.current_recipe_run_deposit.id} should have been empty!`);
});

Then(/there is a log of this (.*) for this deposit/, async function(field_name_descriptor) {

    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain recipe run deposit for this step!');

    const deposit_logs = await require('../../../models').ActionLog.findAll({
        where: {
            recipe_run_deposit_id: this.current_recipe_run_deposit.id
        },
        attributes: ['id', 'details', 'timestamp', 'level', 'translation_key', 'translation_args'],
        order: [
            ['timestamp', 'DESC']
        ]
    });
    chai.assert.isAbove(deposit_logs.length, 0, `Deposit ${this.current_recipe_run_deposit.id} had no associated action logs!`);

    const lowercase_descriptor = _.lowerCase(field_name_descriptor);
    const field_name = _.snakeCase(lowercase_descriptor);

    const deposit_record_value = this.current_recipe_run_deposit[field_name];
    chai.assert.isDefined(deposit_record_value, `Deposit record did not have field value under ${field_name}!`);

    let logs_contain_info = false;
    _.forEach(_.map(deposit_logs, 'details'), text => {
        const lower_text = _.toLower(text);
        logs_contain_info = logs_contain_info || (lower_text.includes(lowercase_descriptor) && lower_text.includes(String(deposit_record_value)))
    });
    chai.assert.isTrue(logs_contain_info, `None of the ${deposit_logs.length} logs about deposit ${this.current_recipe_run_deposit.id} contained info on ${lowercase_descriptor} value of ${deposit_record_value}`);
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

Then('the system will report error related to status', async function() {

    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit by now!');
    chai.assert.isNotNull(this.current_recipe_run_deposit_approve_error, 'Approve action did not generate deposit error!');

    const message = this.current_recipe_run_deposit_approve_error.message;

    chai.assert.include(message, `confirmation is only allowed for Pending`, 'message not indicative of deposit confirmation failure due to status!');
});

Then('I can adjust both values again', async function() {

    chai.assert.isNotNull(this.current_recipe_run_deposit, 'Context should contain pending recipe run deposit for this step!');
    chai.assert.isNotNull(this.current_user, 'Context needs to have current user for this step');

    const { err, results } = await adjust_deposit_values.bind(this)(
        this.current_recipe_run_deposit.id, 
        this.current_user
    );
    chai.assert.isNull(err, `Adjusting deposit should not have produced an error: ${JSON.stringify(err)}`);
})