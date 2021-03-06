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

Given(/^the current (balances|withdraw fees) on the exchanges are:$/, async function(type, table) {

    const exchange_data = table.hashes();
    const { Exchange } = require('../../../models');
    const ccxtUtils = require('../../../utils/CCXTUtils');

    const exchanges = await Exchange.findAll({ raw: true });

    for(let data of exchange_data) {

        const matching_exchange = exchanges.find(e => e.name === data.exchange);

        expect(matching_exchange, `Expected to find exchange "${data.exchange}"`).to.be.not.undefined;

        const connector = await ccxtUtils.getConnector(matching_exchange.api_id);

        delete data.exchange;

        switch(type) {
            case 'balances':
                connector._setBalance(data);
                break;
            
            case 'withdraw fees':
                connector._setWithdrawFees(data);
                break;
        }
        

    }

});