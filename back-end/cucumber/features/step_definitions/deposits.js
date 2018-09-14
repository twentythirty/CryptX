const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given(/^the system has (.*) Deposits$/, async function(status) {

    const { RecipeRunDeposit, RecipeRunDetail, sequelize } = require('../../../models');

    const assets_to_deposit = await RecipeRunDetail.findAll({
        where: { recipe_run_id: this.current_recipe_run.id },
        attributes: [
            'quote_asset_id', 'target_exchange_id',
            [ sequelize.fn('sum', sequelize.col('investment_percentage')), 'investment_percentage' ]
        ],
        group: ['quote_asset_id', 'target_exchange_id']
    });

    return RecipeRunDeposit.bulkCreate(assets_to_deposit.map(asset => {
        
        return {
            amount: _.random(10, 200, true),
            asset_id: asset.quote_asset_id,
            completion_timestamp: new Date(),
            creation_timestamp: new Date(),
            depositor_user_id: World.users.depositor.id,
            fee: _.random(0.1, 2, true),
            recipe_run_id: this.current_recipe_run.id,
            status: RECIPE_RUN_DEPOSIT_STATUSES[status],
            target_exchange_account_id: this.current_exchange_accounts.find(account => {
                return (account.asset_id === asset.quote_asset_id && account.exchange_id === asset.target_exchange_id)
            }).id
        };

    }, { returning: true })).then(deposits => {

        this.current_deposits = deposits;

    });

});