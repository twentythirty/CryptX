const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('the Investment Run has no Recipe Runs', function(){

    const { RecipeRun } = require('../../../models');

    return RecipeRun.destroy({
        where: { investment_run_id: this.current_investment_run.id }
    });

});

/**
 * The recipe run and details will be generated with mostly random assets,
 * As it is more important that the order generation correctly uses the recipe details
 * Rather than the recipe run details are accurate.
 */
Given('the system has Approved Recipe Run with Details', async function() {

    const { RecipeRun, RecipeRunDetail, Asset, Instrument, InstrumentExchangeMapping, Exchange, sequelize } = require('../../../models');

    const exchange = await Exchange.findOne({ where: { name: 'Kraken' } });

    const base_assets = await Asset.findAll({
        where: { is_base: true },
        raw: true
    });

    const instruments = await Instrument.findAll({
        where: {
            quote_asset_id: base_assets.map(asset => asset.id)
        },
        include: {
            model: InstrumentExchangeMapping,
            require: true,
            where: {
                exchange_id: exchange.id
            }
        },
        limit: 20
    });

    this.current_instruments = instruments;

    return sequelize.transaction(transaction => {

        return RecipeRun.create({
            approval_comment: 'I Approved',
            approval_status: RECIPE_RUN_STATUSES.Approved,
            approval_user_id: World.users.investment_manager.id,
            approval_timestamp: new Date(),
            created_timestamp: new Date(),
            investment_run_id: this.current_investment_run.id,
            user_created_id: World.users.investment_manager.id
        }, { transaction }).then(recipe_run => {

            this.current_recipe_run = recipe_run;

            return RecipeRunDetail.bulkCreate(instruments.map(instrument => {

                return {
                    investment_percentage: (100 / instruments.length),
                    quote_asset_id: instrument.quote_asset_id,
                    transaction_asset_id: instrument.transaction_asset_id,
                    recipe_run_id: recipe_run.id,
                    target_exchange_id: exchange.id
                };

            }), { transaction, returning: true }).then(details => {

                this.current_recipe_run_details = details;

            });

        });

    });

});

When('I iniatiate a new Recipe Run', function(){

    return chai
        .request(this.app)
        .post(`/v1/investments/${this.current_investment_run.id}/start_recipe_run`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
            
            expect(result).to.have.status(200);
            expect(result.body.recipe_run).to.an('object');
            
            this.current_recipe_run = result.body.recipe_run;

            this.current_response = result;

        }).catch(error => {

            this.current_response = error;

        });

});

Then(/^the system creates a new Recipe Run with status (.*)$/, async function(expected_status) {

    const { RecipeRun, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const recipe_run = await RecipeRun.findOne({
        where: {
            [Op.or]: [
                { investment_run_id: _.get(this, 'current_investment_run.id') },
                { id: _.get(this, 'current_recipe_run.id') }
            ]
        }
    });

    expect(recipe_run).to.be.not.null;
    expect(recipe_run.approval_status).to.equal(RECIPE_RUN_STATUSES[expected_status]);

    this.current_recipe_run = recipe_run;

});

Then('I am assigned to the Recipe Run as the creator', function() {

    expect(this.current_recipe_run.user_created_id).to.equal(World.current_user.id);

});

Then('a Recipe Run Detail is created for each Whitelisted Asset in Asset Mix', async function() {

    const { RecipeRunDetail, RecipeRunDetailInvestment, InvestmentRunAssetGroup, GroupAsset } = require('../../../models');

    const [ details, asset_mix ] = await Promise.all([
        RecipeRunDetail.findAll({
            where: { recipe_run_id: this.current_recipe_run.id },
            include: RecipeRunDetailInvestment
        }),
        InvestmentRunAssetGroup.findById(this.current_investment_run.investment_run_asset_group_id, {
            include: GroupAsset
        })
    ]);

    const assets = asset_mix.GroupAssets;

    for(let detail of details) {

        const matching_asset = assets.find(a => a.asset_id === detail.transaction_asset_id);

        expect(matching_asset).to.be.not.undefined;

    }

    this.current_recipe_run_details = details;

});

Then('the investment is spread accordingly between each Recipe Detail', function() {
    
    const investment_amounts = this.current_investment_run.amounts.reduce((acc, amount) => {
        return _.assign(acc, { [amount.asset_id]: Decimal(amount.amount) })
    }, {});

    for(let detail of this.current_recipe_run_details) {

        for(let detail_investment of detail.RecipeRunDetailInvestments) {
            
            investment_amounts[detail_investment.asset_id] = investment_amounts[detail_investment.asset_id].minus(detail_investment.amount);

        }

    }

    for(let asset in investment_amounts) {

        expect(investment_amounts[asset].eq(0)).to.be.true;

    }

});

Then('the investment percentage is divided equally between Recipe Details', function() {

    const expected_percentage = Decimal(100).div(this.current_recipe_run_details.length);

    for(let detail of this.current_recipe_run_details) {

        expect(expected_percentage.eq(detail.investment_percentage)).to.be.true;

    }

});

Then('the correct Exchange is assigned to each Detail', async function() {

    const { InstrumentExchangeMapping, Instrument } = require('../../../models');

    for(let detail of this.current_recipe_run_details) {

        const match = await Instrument.findOne({
            where: { 
                quote_asset_id: detail.quote_asset_id,
                transaction_asset_id: detail.transaction_asset_id
            },
            include: {
                model: InstrumentExchangeMapping,
                on: { exchange_id: detail.target_exchange_id },
                required: true
            }
        });

        expect(match).to.be.not.null;

    }

});

Then('the system won\'t allow me to initiate another Recipe Run for this Investment', function() {

    return chai
    .request(this.app)
    .post(`/v1/investments/${this.current_investment_run.id}/start_recipe_run`)
    .set('Authorization', World.current_user.token)
    .catch(result => {   
        
        expect(result).to.have.status(422);
        
        expect(result.response.body.error).to.equal('There is already recipe run pending approval');

    });

});

Then('the system will display an error about the Capitalization not bring up to date', function() {

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error.startsWith(
        'No base asset prices in USD for past 15 minutes found!'
    )).to.be.true;

    expect(error.split('\n')[1].startsWith(
        'Missing recent prices. Please wait for new prices to be fetched'
    )).to.be.true;

});

Then('the system will display an error about missing Instrument Mappings', function() {

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error.startsWith(
        'No base asset prices in USD for past 15 minutes found!'
    )).to.be.true;
    
    expect(error.split('\n')[1].startsWith(
        'Missing USDT instrument mappings for exchanges:'
    )).to.be.true;

});

Then('a new Recipe Run is not created', async function() {

    const { RecipeRun } = require('../../../models');

    const new_recipe = await RecipeRun.findOne({
        where: { investment_run_id: this.current_investment_run.id }
    });

    expect(new_recipe).to.be.null;

});