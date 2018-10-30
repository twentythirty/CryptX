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

Given(/^the system has (\d*) (.*) Cold Storage (Transfers|Transfer) for (\w*)$/, async function(amount, status, plural, asset_symbol) {

    amount = parseInt(amount);

    const { ColdStorageTransfer, ColdStorageAccount, Asset, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    const placed_timestamp_statuses = [
        COLD_STORAGE_ORDER_STATUSES.Sent,
        COLD_STORAGE_ORDER_STATUSES.Completed,
        COLD_STORAGE_ORDER_STATUSES.Failed
    ];

    const completed_timestamp_statuses = [
        COLD_STORAGE_ORDER_STATUSES.Completed
    ];

    const exisitng_transfers = await ColdStorageTransfer.findAll({
        where: {
            status: COLD_STORAGE_ORDER_STATUSES[status],
            cold_storage_account_id: { [Op.ne]: null },
            asset_id: asset.id,
            recipe_run_order_id: this.current_recipe_order ? this.current_recipe_order.id : undefined,
            recipe_run_id: this.current_recipe_run ? this.current_recipe_run.id : undefined
        },
        include: {
            model: ColdStorageAccount,
            where: {
                asset_id: asset.id
            },
            required: true
        }
    });
    let new_transfers = [];

    if(exisitng_transfers.length < amount) {

        const accounts = await ColdStorageAccount.findAll({
            where: { asset_id: asset.id }
        });
   
        expect(accounts.length).to.be.greaterThan(0, `Expected to find at least one Cold Storage Account to create trasnfers`);

        for(let i = 0; i < amount; i++) {

            const account = accounts[_.random(0, accounts.length - 1)];
 
            new_transfers.push({
                amount: _.random(1, 100, true),
                fee: completed_timestamp_statuses.includes(COLD_STORAGE_ORDER_STATUSES[status]) ? _.random(0.01, 1, true) : 0,
                asset_id: account.asset_id,
                cold_storage_account_id: account.id,
                status: COLD_STORAGE_ORDER_STATUSES[status],
                recipe_run_order_id: this.current_recipe_order ? this.current_recipe_order.id : null,
                recipe_run_id: this.current_recipe_run ? this.current_recipe_run.id : null,
                placed_timestamp: placed_timestamp_statuses.includes(COLD_STORAGE_ORDER_STATUSES[status]) ? Date.now() : null,
                completed_timestamp: completed_timestamp_statuses.includes(COLD_STORAGE_ORDER_STATUSES[status]) ? Date.now() : null
            });

        }

        new_transfers = await ColdStorageTransfer.bulkCreate(new_transfers, { returning: true });

    }

    this.current_cold_storage_transfers = exisitng_transfers.concat(new_transfers);

});

Given(/there is a Cold Storage Custodian named "(.*)"/, async function(custodian_name) {

    const { ColdStorageCustodian } = require('../../../models');

    return ColdStorageCustodian.create({
        name: custodian_name
    }).then(custodian => {

        this.current_cold_storage_custodian = custodian;
    });
});

Given('there are no Cold Storage Accounts in the system', function() {

    const { ColdStorageAccount } = require('../../../models');

    return ColdStorageAccount.destroy({ where: { } });

});


Given(/there is a cold storage account for (.*), strategy (.*), address "(.*)"/, async function(coin_long_name, strategy_type, account_address) {

    chai.assert.isNotNull(this.current_cold_storage_custodian, 'Context should contain a custodian by now');
    
    const { Asset, ColdStorageAccount } = require('../../../models');

    const asset = await Asset.findOne({
        where: {
            long_name: coin_long_name
        }
    })
    chai.assert.isNotNull(asset, `Asset for name ${coin_long_name} not found!`);
    chai.assert.isNumber(STRATEGY_TYPES[strategy_type], `Strategy type constant not found for suppleid type ${strategy_type}!`);

    return ColdStorageAccount.create({
        strategy_type: STRATEGY_TYPES[strategy_type],
        address: account_address,
        tag: null,
        asset_id: asset.id,
        cold_storage_custodian_id: this.current_cold_storage_custodian.id 
    })
});

Given(/^there (are|are missing) Cold Storage Accounts required for the Recipe Run$/, async function(are_missing) {

    const { ColdStorageAccount, RecipeRunDetail, sequelize } = require('../../../models');

    const details = await RecipeRunDetail.findAll({
        where: { recipe_run_id: this.current_recipe_run.id }
    });

    expect(details.length).to.be.greaterThan(0, 'Expected to find at least 1 recipe run detail');

    this.current_recipe_run_details = details;

    let accounts = [];
    const asset_ids = _.uniq(details.map(d => d.transaction_asset_id));
    const max = are_missing === 'are missing' ? asset_ids.length / 2 : asset_ids.length;

    for(let i = 0; i < max; i++) {
        accounts.push({
            address: String(_.random(10000, 99999)),
            asset_id: asset_ids[i],
            strategy_type: this.current_investment_run.strategy_type
        });
    }

    accounts = await sequelize.transaction(async transaction => {

        await ColdStorageAccount.destroy({
            where: {}, transaction
        });

        return ColdStorageAccount.bulkCreate(accounts, { transaction, returning: true });

    });

    this.current_cold_storage_accounts = accounts;

});

Given('there are no Cold Storage Transfers in the system', function() {

    const { ColdStorageTransfer } = require('../../../models');

    return ColdStorageTransfer.destroy({ where: {} });

});

Given(/^the (\w*) Cold Storage Transfer has a withdraw request on (\w*)$/, async function(symbol, exchange_name) {

    const { Asset, Exchange } = require('../../../models');
    const ccxtUtils = require('../../../utils/CCXTUtils');
    
    const [ asset, exchange ] = await Promise.all([
        Asset.findOne({ where: { symbol } }),
        Exchange.findOne({ where: { name: exchange_name } })
    ]);

    expect(asset, `Expected to find asset with symbol "${symbol}"`).to.be.not.null;
    expect(exchange, `Expected to find exchange "${exchange_name}"`).to.be.not.null;

    const connector = await ccxtUtils.getConnector(exchange.api_id);

    const transfer = this.current_cold_storage_transfers.find(t => t.asset_id === asset.id);
    expect(transfer, `Expected to find a current transfer with asset id ${asset.id}`).to.be.not.undefined;

    const withdraw = await connector.withdraw(asset.symbol, transfer.amount, transfer.address, transfer.tag);
    transfer.status = COLD_STORAGE_ORDER_STATUSES.Sent;
    transfer.placed_timestamp = new Date(),
    transfer.external_identifier = withdraw.id;

    this.current_cold_storage_transfer = await transfer.save();
    this.current_eachange_connector = connector;

});

Given(/^the status of the withdrawal on the exchange is (\w*)$/, async function(status) {

    const status_map = {
        Pending: 'pending',
        Canceled: 'canceled',
        Failed: 'failed',
        Completed: 'ok'
    };

    this.current_eachange_connector._changeTransactionStatus(this.current_cold_storage_transfer.external_identifier, status_map[status]);

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

        })
        .catch(error => {

            this.current_response = error;

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
    };

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

When('I retrieve the Cold Storage Transfer list', async function() {

    return chai
        .request(this.app)
        .post(`/v1/cold_storage/all`)
        .set('Authorization', World.current_user.token)
        .then(result => {   

            expect(result).to.have.status(200);

            expect(result.body.transfers).to.be.an('array', 'Expected to find a Cold Storage Transfer list in the response body');
            expect(result.body.footer).to.be.an('array', 'Expected to find a footer in the response');

            expect(result.body.transfers.length).to.be.greaterThan(0, 'Expected the list of Transfers to be not empty');

            this.current_cold_storage_transfer_list = result.body.transfers;
            this.current_cold_storage_transfer_footer = result.body.footer;

        });

});

When(/^I edit (the|an) Account with new values:$/, async function(pointer, table) {

    const { ColdStorageAccount } = require('../../../models');

    const [ updated_values ] = table.hashes();

    let account = {};
    switch(pointer) {

        case 'the':
            account = this.current_cold_storage_account;
            break;

        case 'an':
        default:
            acount = await ColdStorageAccount.findOne();
            this.current_cold_storage_account = acount;
            break;

    }

    this.previous_cold_storage_account = account;

    return chai
        .request(this.app)
        .post(`/v1/cold_storage/accounts/${account.id}/edit`)
        .set('Authorization', World.current_user.token)
        .send(updated_values)
        .then(result => {   

            expect(result).to.have.status(200);

            expect(result.body.account).to.be.an('object', 'Expected to find an updated Cold Storage account object');

            this.current_cold_storage_account = result.body.account;

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

Then('I can only add one Cold Storage Account with the same strategy, asset and custodian', function() {

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

            expect(error).to.equal(`Account with the same strategy, asset and custodian already exists`);

        });

});

Then('the system will display an error about using a non-cryptocurrency asset', function() {

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error).to.equal(`Asset "${this.current_asset.symbol}" is not a cryptocurrency`);

});

Then('a new Cold Storage Account is not created', async function() {

    const { ColdStorageAccount } = require('../../../models');

    const account = await ColdStorageAccount.findOne({
        where: { address: this.current_cold_storage_account_address }
    });

    expect(account, `Expected not find a Cold Storage Account with adddress ${this.current_cold_storage_account_address}`).to.be.null;
 
});

Then(/^(.*) Transfers (won't|will) have timestamps and fee$/, function(statuses, will) {

    will = (will === 'will');

    const transfer_statuses = World.parseStatuses(statuses, COLD_STORAGE_ORDER_STATUSES, 'cold_storage_transfers.status');
    
    const matching_transfers = this.current_cold_storage_transfer_list.filter(t => transfer_statuses.includes(t.status));
    expect(matching_transfers.length).to.be.greaterThan(0, `Expected at least one ${statuses} Transfer`);

    if(will) {
        for(let transfer of matching_transfers) {

            expect(new Date(transfer.placed_timestamp).getTime(), 'Expected a propper placed timestamp').to.be.not.NaN;
            expect(new Date(transfer.completed_timestamp).getTime(), 'Expected a propper completed timestamp').to.be.not.NaN;
            expect(parseFloat(transfer.exchange_withdrawal_fee), 'Expected the Transfer fee to a be a number').to.be.not.NaN;
    
        }
    }
    else {
        for(let transfer of matching_transfers) {

            expect(transfer.placed_timestamp, 'Expected the Cold Storage Transfer placed timestamp to be not set').to.be.null;
            expect(transfer.completed_timestamp, 'Expected the Cold Storage Transfer completed timestamp to be not set').to.be.null;
            expect(parseFloat(transfer.exchange_withdrawal_fee)).to.equal(0, 'Expected the Cold Storage Transfer fee to be not set');
    
        }
    }

});

Then('the net amount will be calculated by subtracting the fee from the gross amount', function() {

    for(let transfer of this.current_cold_storage_transfer_list) {

        expect(Decimal(transfer.net_amount).eq(Decimal(transfer.gross_amount).minus(transfer.exchange_withdrawal_fee)), 
        'Expected the Transfet net amount to equal = gross amount - fee').to.be.true

    }

});

Then('the Exchange, Address and Asset of the source account will match the Transfer', async function() {

    const { ExchangeAccount, Exchange, Asset } = require('../../../models');

    for(let transfer of this.current_cold_storage_transfer_list) {

        const [ asset, exchange ] = await Promise.all([
            Asset.findOne({
                where: { symbol: transfer.asset }
            }),
            Exchange.findOne({
                where: { name: transfer.source_exchange }
            })
        ]);

        expect(asset, `Expected to find Asset with symbol ${transfer.asset}`).to.be.not.null;
        expect(exchange, `Expected to find Exchange with the name ${transfer.exchange}`).to.be.not.null;

        const exchange_account = await ExchangeAccount.findOne({
            where: { exchange_id: exchange.id, asset_id: asset.id }
        });

        expect(exchange_account, 'Expected to find a matching exchange acccount').to.be.not.null;
        expect(transfer.source_account).to.equal(exchange_account.address, 'Expected the Exchange account addresses to match');

    }

});

Then('I will see the Custodian name based on the Cold Storage Account it is being transfered to', async function() {

    const { ColdStorageAccount, ColdStorageCustodian, ColdStorageTransfer } = require('../../../models');

    const transfers = await ColdStorageTransfer.findAll({
        where: {
            id: this.current_cold_storage_transfer_list.map(t => t.id)
        },
        include: {
            model: ColdStorageAccount,
            include: ColdStorageCustodian
        }
    });

    for(let transfer of this.current_cold_storage_transfer_list) {

        const matching_transfer = transfers.find(t => t.id === transfer.id);

        expect(transfer.custodian).to.equal(_.get(matching_transfer, 'ColdStorageAccount.ColdStorageCustodian.name'), 'Expected the custodian names to match');

    };

});

Then('the Transfers footer will show a number of distinct Assets and Exchanges', function() {

    const transfers = this.current_cold_storage_transfer_list;
    const footer = this.current_cold_storage_transfer_footer;

    const asset_column = footer.find(f => f.name === 'asset');
    const exchange_column = footer.find(f => f.name === 'source_exchange');

    const unique_by_asset = _.uniqBy(transfers, 'asset');
    const unique_by_exchange = _.uniqBy(transfers, 'source_exchange');

    expect(parseInt(asset_column.value)).to.equal(unique_by_asset.length, 'Expected the number of unique Assets to equal the number in the footer');
    expect(parseInt(exchange_column.value)).to.equal(unique_by_exchange.length, 'Expected the number of unique Exchanges to equal the number in the footer');

});

Then('the Transfers footer will show a number of Pending Transfers', function() {

    const transfers = this.current_cold_storage_transfer_list;
    const footer = this.current_cold_storage_transfer_footer;

    const footer_column = footer.find(f => f.name === 'status');

    const pending_transfers = transfers.filter(t => t.status === `cold_storage_transfers.status.${COLD_STORAGE_ORDER_STATUSES.Pending}`)

    expect(parseInt(footer_column.value)).to.equal(pending_transfers.length, 'Expected the number of pending Transfers to equal the number in the footer');

});

Then(/^the Cold Storage Account (\w*) will be "(.*)"$/, async function(field, expected_value) {

    const { ColdStorageAccount } = require('../../../models');

    const account = await ColdStorageAccount.findById(this.current_cold_storage_account.id);

    expect(account, `Expected to find Cold Storage Account with id "${this.current_cold_storage_account.id}"`).to.be.not.null;

    this.current_cold_storage_account = account;

    expect(account[field]).to.equal(expected_value, `Expected Cold Storage Account ${field} to equal ${expected_value}`);

});

Then('the Cold Storage Account asset, strategy and custodian will remain unchanged', function() {

    const updated = this.current_cold_storage_account;
    const original = this.previous_cold_storage_account;

    expect(original.asset_id).to.equal(updated.asset_id, `Expected the updated Cold Storage Account to have the same asset as the original`);
    expect(original.strategy_type).to.equal(updated.strategy_type, `Expected the updated Cold Storage Account to have the same strategy as the original`);
    expect(original.custodian_id).to.equal(updated.custodian_id, `Expected the updated Cold Storage Account to have the same custodian as the original`);

});

Then(/^(.*) Cold Storage (Transfers|Transfer) will remain unchanged$/, async function(symbols, plural){

    const { Asset, ColdStorageTransfer } = require('../../../models');

    const asset_symbols = symbols.split(/and|,/).map(a => a.trim());

    const assets = await Asset.findAll({
        where: { symbol: asset_symbols }
    });

    expect(assets.length).to.equal(asset_symbols.length, `Expected to find ${asset_symbols.length} symbols : ${symbols}`);

    const transfers = await ColdStorageTransfer.findAll({
        where: { asset_id: assets.map(a => a.id) }
    });

    for(let transfer of transfers) {

        const matching_transfer = this.current_cold_storage_transfers.find(t => t.id === transfer.id);
        if(!matching_transfer) continue; //In case there are unreleated transfers
        //Deep equal won't work as some value, liek fee, is string in one version and not in the other.
        for(let field in transfer) {
            if(_.isUndefined(matching_transfer[field])) continue;

            expect(String(transfer[field])).to.equal(String(matching_transfer[field]), `Expected fields "${field}" to match`);
        }

    }

});

Then(/^([A-Z]*) Cold Storage (Transfers|Transfer) (will have (?:.*)|status will be (?:.*))$/, async function(symbols, plural, scenario) {

    const { Asset, ColdStorageTransfer } = require('../../../models');
    
    const asset_symbols = symbols.split(/and|,/).map(a => a.trim());

    const assets = await Asset.findAll({
        where: { symbol: asset_symbols }
    });

    expect(assets.length).to.equal(asset_symbols.length, `Expected to find ${asset_symbols.length} assets : "${symbols}"`);

    const transfers = await ColdStorageTransfer.findAll({
        where: { asset_id: assets.map(a => a.id) }
    });

    for(let transfer of transfers) {

        switch(scenario) {

            case 'status will be Sent':
            case 'status will be Canceled':
            case 'status will be Failed':
            case 'status will be Completed':
                const status_name = scenario.trim().split(' ').slice(-1);
                expect(transfer.status).to.equal(COLD_STORAGE_ORDER_STATUSES[status_name], `Expected the status of the transfer CST-${transfer.id} to be ${status_name}`);
                break;

            case 'will have the placed timestamp set':
                expect(transfer.placed_timestamp).to.be.a('date', `Expected the transfer CLT-${transfer.id} to have a placed timestamp`);
                break;

            case 'will have the completed timestamp set':
                expect(transfer.completed_timestamp).to.be.a('date', `Expected the transfer CLT-${transfer.id} to have a completed timestamp`);
                break;

            case 'will have the external identifier set':
                expect(transfer.external_identifier).to.be.a('string', `Expected the transfer CST-${transfer.id} to have an external identifier`);
                break;

            case 'will have the fee set':
                expect(parseFloat(transfer.fee)).to.be.a('number', `Expected the transfer CST-${transfer.id} to have a fee set`).and.greaterThan(0, `Expected the transfer CST-${transfer.id} to have a fee greater than 0`);
                break;

            default:
                throw new Error(`Unknown validation scenario: ${scenario}`);

        }

    }

});

Then('I will see an error about approving a non Pending Cold Storage Transfer', function() {

    const error_message = _.get(this.current_response, 'response.body.error');

    const possible_errors = ['Only Pending transfer are allowed to be approved.', 'Cannot set the same status twice.'];

    expect(possible_errors).includes(error_message);

});