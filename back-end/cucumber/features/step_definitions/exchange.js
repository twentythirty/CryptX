const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given(/^the system has Exchange Account for (.*) on (.*)$/, async function(asset_symbol, exchange_name) {

    const { Exchange, ExchangeAccount, Asset } = require('../../../models');

    const [ exchange, asset ] = await Promise.all([
        Exchange.findOne({ where: { name: exchange_name } }),
        Asset.findOne({ where: { symbol: asset_symbol } })
    ]);

    return ExchangeAccount.findCreateFind({ where: {
        account_type: EXCHANGE_ACCOUNT_TYPES.Trading,
        address: `${asset_symbol}-${exchange_name}`,
        asset_id: asset.id,
        exchange_id: exchange.id
    }}).then(result => {

        const [ account ] = result;
 
        if(!this.current_exchange_accounts) this.current_exchange_accounts = [];

        this.current_exchange_accounts.push(account);
        this.current_exchange_account = account;

    });

});