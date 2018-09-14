const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('the current Investment Run has no recipe runs', function(){

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

When('I create a new Recipe Run', function(){

    return chai
        .request(this.app)
        .post(`/v1/investments/${this.current_investment_run.id}/start_recipe_run`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
            
            expect(result).to.have.status(200);
            expect(result.body.recipe_run).to.an('object');
            
            this.current_recipe_run = result.body.recipe_run;

        })
        .catch(error => {
            //console.error(error)
        })

});