const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const { nullOrNumber, greaterThanOrEqual, lessThanOrEqual } = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given(/^the system has (\d*) Cold Storage Custodians$/, async function(amount) {
 
    amount = parseInt(amount);

    const { ColdStorageCustodian } = require('../../../models');

    const custodian_names = [
        'Coins ltd.',
        'Safety COins',
        'BitJim',
        'SafeToPlace',
        'UKEZ'
    ];

    const current_custodians = await ColdStorageCustodian.findAll();
    let new_custodians = [];

    if(current_custodians.length < amount) {

        const needed_amount = amount - current_custodians.length;

        for(let i = 0; i < needed_amount; i++) new_custodians.push({ name: custodian_names[_.random(0, custodian_names.length - 1)] });

        new_custodians = await ColdStorageCustodian.bulkCreate(new_custodians, { returning: true });

    }

    this.current_custodians = current_custodians.concat(new_custodians);

});

Given(/^the system has (.*) Cold Storage Account for (.*)$/, async function(strategy_type, asset_symbol) {

    const { ColdStorageCustodian, ColdStorageAccount, Asset, sequelize } = require('../../../models');

    const [ custodian ] = await ColdStorageCustodian.findAll({
        order: sequelize.literal('random()')
    });

    expect(custodian, 'Expected to find at least one custodian to create an account').to.be.not.undefined;

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    expect(asset, `Expected to find an asset with symbol ${asset_symbol}`).to.be.not.null;

    const exisitng_account = await ColdStorageAccount.findOne({
        where: {
            strategy_type: STRATEGY_TYPES[strategy_type],
            asset_id: asset.id 
        }
    });

    if(exisitng_account) {
        this.current_cold_storage_account = exisitng_account;
        return;
    }

    this.current_cold_storage_account = await ColdStorageAccount.create({
        address: `${custodian.name}-${_.random(1000, 5000, false)}`,
        asset_id: asset.id,
        cold_storage_custodian_id: custodian.id,
        strategy_type: STRATEGY_TYPES[strategy_type],
        tag: asset.symbol
    });

});

Given(/^the system has (.*) (.*) Cold Storage (Transfers|Transfer)$/, async function(amount, status, plural) {

    amount = parseInt(amount);

    const { ColdStorageTransfer, ColdStorageAccount } = require('../../../models');

    const exisitng_transfers = await ColdStorageTransfer.findAll({
        where: { status: COLD_STORAGE_ORDER_STATUSES[status] }
    });
    let new_transfers = [];

    if(exisitng_transfers.length < amount) {

        const accounts = await ColdStorageAccount.findAll();

        expect(accounts.length).to.be.greaterThan(0, `Expected to find at least one Cold Storage Account to create trasnfers`);

        for(let i = 0; i < amount; i++) {

            const account = accounts[_.random(0, accounts.length - 1)];

            new_transfers.push({
                amount: _.random(1, 100, true),
                asset_id: account.asset_id,
                cold_storage_account_id: account.id,
                status: COLD_STORAGE_ORDER_STATUSES[status],
                recipe_run_order_id: this.current_recipe_order ? this.current_recipe_order.id : null
            });

        }

        new_transfers = await ColdStorageTransfer.bulkCreate(new_transfers, { returning: true });

    }

    this.current_cold_storage_transfers = exisitng_transfers.concat(new_transfers);

});

Given('there are no Cold Storage Accounts in the system', function() {

    const { ColdStorageAccount } = require('../../../models');

    return ColdStorageAccount.destroy({ where: { } });

});

When(/^I select a (.*) Cold Storage Transfer$/, async function(status) {

    const { ColdStorageTransfer } = require('../../../models');

    const transfer = await ColdStorageTransfer.findOne({
        where: { status: COLD_STORAGE_ORDER_STATUSES[status] }
    });

    expect(transfer, `Expected to find a Cold Storage Transfer with status ${status}`).to.be.not.null;

    this.current_cold_storage_transfer = transfer;

});

When(/^I (approve|complete) (a|the) (.*) Cold Storage Transfer$/, async function(action, pointer, status) {

    const { ColdStorageTransfer } = require('../../../models');

    let transfer = null;

    switch(pointer) {

        case 'the':
            transfer = this.current_cold_storage_transfer;
            break;

        case 'a':
        default: 
            transfer = await ColdStorageTransfer.findOne({
                where: { status: COLD_STORAGE_ORDER_STATUSES[status] }
            });
            this.current_cold_storage_transfer = transfer;
            break;

    }

    expect(transfer, `Expected to get a transfer to ${action}`).to.be.not.null;

    return chai
        .request(this.app)
        .post(`/v1/cold_storage/${transfer.id}/${action.toLowerCase()}`)
        .set('Authorization', World.current_user.token)
        .then(result => {   

            expect(result).to.have.status(200);

            this.check_log_id = transfer.id;

        });

});

When('I select a Cold Storage Custodian', async function() {

    const { ColdStorageCustodian, sequelize } = require('../../../models');

    const custodian = await ColdStorageCustodian.findOne({
        order: sequelize.literal('random()')
    });

    expect(custodian, 'Expected to find any Custodian').to.be.not.null;

    this.current_custodian = custodian;

});

When(/^I create a new (LCI|MCI) Cold Storage Account$/, function(strategy) {

    const address = String(_.random(10000, 99999));
    this.current_cold_storage_account_address = address;

    const account = {
        strategy_type: STRATEGY_TYPES[strategy],
        asset_id: this.current_asset.id,
        custodian_id: this.current_custodian.id,
        address: address
    }

    return chai
        .request(this.app)
        .post(`/v1/cold_storage/accounts/add`)
        .set('Authorization', World.current_user.token)
        .send(account)
        .then(result => {   

            expect(result).to.have.status(200);

            expect(result.body.account).to.be.an('object', 'Expected to find a Cold Storage Account object in the response body');

            this.current_response = result;

        }).catch(error => {

            this.current_response = error;

        });

});

Then(/^I can only (.*) Cold Storage Transfers with status (.*)$/, async function(action, status) {

    const { ColdStorageTransfer, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const error_map = {
        approve: ['Only Pending transfer are allowed to be approved.', 'Cannot set the same status twice.']
    };

    const transfer = await  ColdStorageTransfer.findOne({
        where: {
            status: { [Op.ne]: COLD_STORAGE_ORDER_STATUSES[status] }
        }
    });

    expect(transfer, `Expected to find a Cold Storage Transfer with status other than ${status}`).to.be.not.null;
    this.current_cold_storage_transfer = transfer;

    return chai
        .request(this.app)
        .post(`/v1/cold_storage/${transfer.id}/${action.toLowerCase()}`)
        .set('Authorization', World.current_user.token)
        .catch(result => {   

            expect(result).to.have.status(422);

            const error = result.response.body.error;

            expect(error_map[action]).includes(error);

        });

});

Then('a new Cold Storage Account is saved to the database', async function() {

    const { ColdStorageAccount } = require('../../../models');

    const account = await ColdStorageAccount.findOne({
        where: { address: this.current_cold_storage_account_address }
    });

    expect(account, `Expected to find a Cold Storage Account with address ${this.current_cold_storage_account_address}`).to.be.not.null;

    this.current_cold_storage_account = account;

});

Then('the selected Asset and Custodian is assigned to it', function() {

    const account = this.current_cold_storage_account;

    expect(account.cold_storage_custodian_id).to.equal(this.current_custodian.id, 'Expected the Custodian ids to match');
    expect(account.asset_id).to.equal(this.current_asset.id, 'Expected Assets ids to match');

});

Then('I can only add one Cold Storage Account with the same address', function() {

    const account = {
        strategy_type: STRATEGY_TYPES.LCI,
        asset_id: this.current_asset.id,
        custodian_id: this.current_custodian.id,
        address: this.current_cold_storage_account.address
    }

    return chai
        .request(this.app)
        .post(`/v1/cold_storage/accounts/add`)
        .set('Authorization', World.current_user.token)
        .send(account)
        .catch(result => {

            expect(result).to.has.status(422);

            const error = result.response.body.error;

            expect(error).to.equal(`Account with public address "${account.address}" already exists`);

        });

});