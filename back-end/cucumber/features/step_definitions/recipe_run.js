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

Given('the Investment Run has no Recipe Runs', function () {

    const {
        RecipeRun
    } = require('../../../models');

    return RecipeRun.destroy({
        where: {
            investment_run_id: this.current_investment_run.id
        }
    });

});

Given('there is a recipe run with status Pending', async function () {

    const investmentService = require('../../../services/InvestmentService');
    const new_run = await investmentService.createRecipeRun(
        this.current_investment_run.user_created_id,
        this.current_investment_run.id
    )
    
    chai.assert.equal(new_run.approval_status, RECIPE_RUN_STATUSES.Pending, 'New run did not have status pending!');

    //update investment run in world
    this.prev_investment_run = this.current_investment_run;
    this.current_investment_run = await require('../../../models').InvestmentRun.findById(this.current_investment_run.id);

    this.current_recipe_run = new_run;
});

Given('at least one recipe run detail is missing an exchange instrument mapping', async function() {

    const recipe_run = this.current_recipe_run;
    const run_details = await recipe_run.getRecipeRunDetails();

    chai.assert.isArray(run_details, `Recipe run ${recipe_run.id} did not have details array!`);
    chai.assert.isAbove(run_details.length, 0, `Recipe run ${recipe_run.id} generated 0 recipe run details!`);

    let a_detail = run_details[run_details.length == 1? 0 : _.random(0, run_details.length - 1, false)];
    const sequelize = require('../../../models').sequelize;
    const Instrument = require('../../../models').Instrument;

    const no_mapping_instruments = await sequelize.query(`
    SELECT i.*
    FROM instrument i
    LEFT JOIN instrument_exchange_mapping iem ON i.id = iem.instrument_id
    WHERE iem.external_instrument_id IS NULL
`, { 
        type: sequelize.Sequelize.QueryTypes.SELECT, 
        model: Instrument
    })

    //take one of the instrumetns without mappings
    let empty_instrument;
    if (no_mapping_instruments.length > 0) {
        empty_instrument = no_mapping_instruments[no_mapping_instruments.length == 1? 0 : _.random(0, no_mapping_instruments.length - 1, false)];
    } else {
        //create new one if they dont exist
        empty_instrument = await Instrument.create({
            transaction_asset_id: a_detail.quote_asset_id,
            quote_asset_id: a_detail.transaction_asset_id,
            symbol: 'TEST/NOMAP'
        })
    }
    const models = require('../../../models');
    //insert instrument into run detail
    a_detail.transaction_asset_id = empty_instrument.transaction_asset_id;
    a_detail.quote_asset_id = empty_instrument.quote_asset_id;
    await a_detail.save();
    
    //fetch the detail anew to create the mapping
    a_detail = await models.RecipeRunDetail.findById(a_detail.id, {
        include: [
            {
                model: models.Exchange,
                as: 'target_exchange'
            },
            {
                model: models.Asset,
                as: 'transaction_asset'
            },
            {
                model: models.Asset,
                as: 'quote_asset'
            }
        ]
    })
    
    this.recipe_run_detail_missing_mapping = {
        instrument_symbol: `${a_detail.transaction_asset.symbol}/${a_detail.quote_asset.symbol}`,
        exchange_name: a_detail.target_exchange.name
    }
});

/**
 * The recipe run and details will be generated with mostly random assets,
 * As it is more important that the order generation correctly uses the recipe details
 * Rather than the recipe run details are accurate.
 */
Given(/^the system has (\w*) Recipe Run with Details$/, async function (status) {

    const {
        RecipeRun,
        RecipeRunDetail,
        Asset,
        Instrument,
        InstrumentExchangeMapping,
        Exchange,
        sequelize
    } = require('../../../models');

    let where = {};

    if(this.current_exchange_accounts) {
        where = {
            id: this.current_exchange_accounts[0].exchange_id
        }
    }

    const exchange = await Exchange.findOne({ where });

    const base_assets = await Asset.findAll({
        where: {
            is_base: true
        },
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
            approval_comment: status === 'Pending' ? '' : 'I Approved',
            approval_status: RECIPE_RUN_STATUSES[status],
            approval_user_id: status === 'Pending' ? null : World.users.investment_manager.id,
            approval_timestamp: status === 'Pending' ? null : new Date(),
            created_timestamp: new Date(),
            investment_run_id: this.current_investment_run.id,
            user_created_id: World.users.investment_manager.id
        }, {
            transaction
        }).then(recipe_run => {

            this.current_recipe_run = recipe_run;

            return RecipeRunDetail.bulkCreate(instruments.map(instrument => {

                return {
                    investment_percentage: (100 / instruments.length),
                    quote_asset_id: instrument.quote_asset_id,
                    transaction_asset_id: instrument.transaction_asset_id,
                    recipe_run_id: recipe_run.id,
                    target_exchange_id: exchange.id
                };

            }), {
                transaction,
                returning: true
            }).then(details => {

                this.current_recipe_run_details = details;

            });

        });

    });

});

Given('the Recipe Run Details are as followed:', async function(table) {

    const { RecipeRunDetail, RecipeRunDetailInvestment, Asset, Exchange, sequelize } = require('../../../models');

    let recipe_details = table.hashes();

    const [ transaction_assets, quote_assets, deposit_assets, exchanges ] = await Promise.all([
        Asset.findAll({ where: { symbol: recipe_details.map(d => d.transaction_asset) } }),
        Asset.findAll({ where: { symbol: recipe_details.map(d => d.quote_asset) } }),
        Asset.findAll({ where: { is_deposit: true } }),
        Exchange.findAll({ where: { name: recipe_details.map(d => d.exchange) } })
    ]);

    recipe_details = recipe_details.map(detail => {

        const transaction_asset = transaction_assets.find(a => a.symbol === detail.transaction_asset);
        const quote_asset = quote_assets.find(a => a.symbol === detail.quote_asset);
        const exchange = exchanges.find(e => e.name === detail.exchange);

        expect(transaction_asset, `Expected to find transaction asset ${detail.transaction_asset}`).to.be.not.undefined;
        expect(quote_asset, `Expected to find quote asset ${detail.quote_asset}`).to.be.not.undefined;
        expect(exchange, `Expected to find exchange ${detail.exchange}`).to.be.not.undefined;

        return {
            recipe_run_id: this.current_recipe_run.id,
            transaction_asset_id: transaction_asset.id,
            quote_asset_id: quote_asset.id,
            target_exchange_id: exchange.id,
            investment_percentage: detail.percentage,
            investments: detail.investment_currency.split('/').map((currency, index) => {
                return {
                    asset_id: deposit_assets.find(a => a.symbol === currency).id,
                    amount: detail.investment_amount.split('/')[index]
                };
            })
        };

    });
    
    return sequelize.transaction(async transaction => {

        await RecipeRunDetail.destroy({
            where: { recipe_run_id: this.current_recipe_run.id },
            transaction
        });

        return Promise.all(recipe_details.map(async detail => {

            const new_detail = await RecipeRunDetail.create(detail, { transaction });
            const new_investments = detail.investments.map(i => {
                return Object.assign(i, { recipe_run_detail_id: new_detail.id })
            });

            return RecipeRunDetailInvestment.bulkCreate(new_investments, { transaction });

        }));

    });

});

Given(/^the Recipe Run was created on (.*)$/, function(date_string) {

    const { RecipeRun } = require('../../../models');

    return RecipeRun.update({
        created_timestamp: Date.parse(date_string)
    }, {
        where: {
            id: this.current_recipe_run.id
        }
    });

});

Given(/^the Recipe Run was approved by (.*) on (.*)$/, function(user_name, date_string) {

    const { RecipeRun } = require('../../../models');

    const user = World.users[_.snakeCase(user_name)];
    expect(user, `Expected to have user "${user_name}"`).to.be.not.undefined;

    return RecipeRun.update({
        approval_timestamp: Date.parse(date_string),
        approval_user_id: user.id,
        approval_comment: 'I approve.',
        approval_status: RECIPE_RUN_STATUSES.Approved
    }, {
        where: {
            id: this.current_recipe_run.id
        }
    });

});

When('I initiate a new Recipe Run', function () {

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
            //World.print(error.response.body.error);
            this.current_response = error;

        });

});

When(/^(.*) recipe run with provided rationale$/, async function (action) {

    const action_status = _.toLower(action) == 'approve' ? RECIPE_RUN_STATUSES.Approved : RECIPE_RUN_STATUSES.Rejected;

    const investmentService = require('../../../services/InvestmentService');

    chai.assert.isObject(this.current_recipe_run, `No current recipe run in context!`)

    const [err, result] = await to(investmentService.changeRecipeRunStatus(
        this.current_user.id,
        this.current_recipe_run.id,
        action_status,
        `Testing ${action}`
    ))

    //preserve error for future steps, if any
    if (err != null) {
        this.current_recipe_run_status_change_error = err.message;
    }
    //refetch relevant info into world after status change to check later
    this.prev_recipe_run = this.current_recipe_run;
    this.current_recipe_run = await require('../../../models').RecipeRun.findById(this.current_recipe_run.id);
    this.current_recipe_run.status = this.current_recipe_run.approval_status;
    //move investment run to also provide history
    this.prev_investment_run = this.current_investment_run;
    this.current_investment_run = await require('../../../models').InvestmentRun.findById(this.current_investment_run.id);
});

When('I fetch the Recipe Run details', async function() {

    const [ recipe_run, recipe_run_details ] = await Promise.all([
        chai
        .request(this.app)
        .get(`/v1/recipes/${this.current_recipe_run.id}`)
        .set('Authorization', World.current_user.token),
        chai
        .request(this.app)
        .post(`/v1/recipe_details/of_recipe/${this.current_recipe_run.id}`)
        .set('Authorization', World.current_user.token)
        .send({
            order: [
                { by: 'investment_eth', order: 'DESC' },
                { by: 'investment_btc', order: 'DESC' },
                { by: 'transaction_asset', order: 'ASC' }
            ]
        })
    ]);

    this.current_recipe_run_details = recipe_run.body.recipe_run;
    this.current_recipe_run_details_list = recipe_run_details.body.recipe_details;
    this.current_recipe_run_details_footer = recipe_run_details.body.footer;

    //World.print(recipe_run.body);
    //World.print(recipe_run_details.body);

    /*World.printDataTable(recipe_run_details.body.recipe_details, {
        attributes: ['transaction_asset', 'quote_asset', 'target_exchange', 'investment_usd', 'investment_btc', 'investment_eth', 'investment_percentage']
    });*/

});

Then(/^the system creates a new Recipe Run with status (.*)$/, async function (expected_status) {

    const {
        RecipeRun,
        sequelize
    } = require('../../../models');
    const {
        Op
    } = sequelize;

    const recipe_run = await RecipeRun.findOne({
        where: {
            [Op.or]: [{
                    investment_run_id: _.get(this, 'current_investment_run.id')
                },
                {
                    id: _.get(this, 'current_recipe_run.id')
                }
            ]
        }
    });

    expect(recipe_run, 'Expected to find a new recipe run in the database').to.be.not.null;
    expect(recipe_run.approval_status).to.equal(RECIPE_RUN_STATUSES[expected_status], `Expected the status of the recipe run to be ${expected_status}`);

    this.current_recipe_run = recipe_run;

});

Then('I am assigned to the Recipe Run as the creator', function () {

    expect(this.current_recipe_run.user_created_id).to.equal(World.current_user.id, 'Expected the reciep run to have user created as the currently logged in user');

});

Then('the recipe run will have no conversions', async function () {

    chai.assert.isObject(this.current_recipe_run, 'Context has no recipe run!');

    const conversions = await require('../../../models').InvestmentAssetConversion.findAll({
        where: {
            recipe_run_id: this.current_recipe_run.id
        }
    });

    if (conversions != null) {
        //using 2 separate asserts since this version of chai deosnt have an isEmpty method
        chai.assert.isArray(conversions);
        chai.assert.equal(conversions.length, 0, `Expected recipe run ${this.current_recipe_run.id} not to generate any conversions, got ${conversions.length}!`);
    }
});

Then('the recipe run will have conversions generated', async function() {

    chai.assert.isObject(this.current_recipe_run, 'Context has no recipe run!');

    const conversions = await require('../../../models').InvestmentAssetConversion.findAll({
        where: {
            recipe_run_id: this.current_recipe_run.id
        }
    });

    //using 2 separate asserts since this version of chai deosnt have an isEmpty method
    chai.assert.isArray(conversions);
    chai.assert.isAbove(conversions.length, 0, `Expected recipe run ${this.current_recipe_run.id} to generate some conversions, got ${conversions.length}!`);
})

Then(/^all the recipe run conversions will have status (.*)/, async function(status) {

    chai.assert.isObject(this.current_recipe_run, 'Context has no recipe run!');

    const conversions = await require('../../../models').InvestmentAssetConversion.findAll({
        where: {
            recipe_run_id: this.current_recipe_run.id
        }
    });

    //using 2 separate asserts since this version of chai deosnt have an isEmpty method
    chai.assert.isArray(conversions);
    chai.assert.isAbove(conversions.length, 0, `Expected recipe run ${this.current_recipe_run.id} to generate some conversions, got ${conversions.length}!`);

    const required_status = require('../../../config/model_constants').ASSET_CONVERSION_STATUSES[status];
    chai.assert.isDefined(required_status, `No valid conversion status found for word ${status}`);

    conversions.forEach(conversion => {
        chai.assert.equal(conversion.status, required_status, `Conversion had bad status!`);
    });
});

Then('a Recipe Run Detail is created for each Whitelisted Asset in Asset Mix', async function () {

    const {
        RecipeRunDetail,
        RecipeRunDetailInvestment,
        InvestmentRunAssetGroup,
        GroupAsset
    } = require('../../../models');

    const [details, asset_mix] = await Promise.all([
        RecipeRunDetail.findAll({
            where: {
                recipe_run_id: this.current_recipe_run.id
            },
            include: RecipeRunDetailInvestment
        }),
        InvestmentRunAssetGroup.findById(this.current_investment_run.investment_run_asset_group_id, {
            include: GroupAsset
        })
    ]);

    const assets = asset_mix.GroupAssets;

    for (let detail of details) {

        const matching_asset = assets.find(a => a.asset_id === detail.transaction_asset_id);

        expect(matching_asset, 'Expected to find matching asset in the asset mix for the recipe run detail').to.be.not.undefined;

    }

    this.current_recipe_run_details = details;

});

Then('the investment amounts are divided accordingly between each Recipe Detail', function () {

    /*const investment_amounts = this.current_investment_run.amounts.reduce((acc, amount) => {
        return _.assign(acc, {
            [amount.asset_id]: Decimal(amount.amount)
        })
    }, {});
 
    for (let detail of this.current_recipe_run_details) {

        for (let detail_investment of detail.RecipeRunDetailInvestments) {

            investment_amounts[detail_investment.asset_id] = investment_amounts[detail_investment.asset_id].minus(detail_investment.amount);

        }

    }

    for (let asset in investment_amounts) {

        expect(investment_amounts[asset].eq(0), 'Expected the investment amounts to be spread correctly across each detail').to.be.true;

    }
    */
    const sums = _.fromPairs(this.current_investment_run.amounts.map(a => {
        return [ a.asset_id, Decimal(0) ]
    }));

    for (let detail of this.current_recipe_run_details) {

        for (let detail_investment of detail.RecipeRunDetailInvestments) {

            sums[detail_investment.asset_id] = sums[detail_investment.asset_id].plus(detail_investment.amount || 0);

        }

    }

    for (let investment of this.current_investment_run.amounts) {

        expect(Decimal(investment.amount).toFixed(2)).to.equal(sums[investment.asset_id].toFixed(2), 'Expected the sums to match');

    }

});

Then('the investment percentage is divided equally between Recipe Details', function () {

    const expected_percentage = Decimal(100).div(this.current_recipe_run_details.length);

    for (let detail of this.current_recipe_run_details) {

        expect(expected_percentage.toFixed(2)).to.equal(Decimal(detail.investment_percentage).toFixed(2), `Expected details to have equaly divided investment percentage, expected: ${expected_percentage.toString()}%, got: ${detail.investment_percentage}%`);

    }

});

Then('the correct Exchange is assigned to each Detail', async function () {

    const {
        InstrumentExchangeMapping,
        Instrument
    } = require('../../../models');

    for (let detail of this.current_recipe_run_details) {

        if(detail.quote_asset_id === detail.transaction_asset_id) continue;

        const match = await Instrument.findOne({
            where: {
                quote_asset_id: detail.quote_asset_id,
                transaction_asset_id: detail.transaction_asset_id
            },
            include: {
                model: InstrumentExchangeMapping,
                on: {
                    exchange_id: detail.target_exchange_id
                },
                required: true
            }
        });

        expect(match, `
            Expected to find Instrument with transaction asset id : ${detail.transaction_asset_id} 
            and quote asset id: ${detail.quote_asset_id},
            That is also mapped to Exchange with id ${detail.target_exchange_id}
        `).to.be.not.null;

    }

});

Then('the system won\'t allow me to initiate another Recipe Run for this Investment', function () {

    return chai
        .request(this.app)
        .post(`/v1/investments/${this.current_investment_run.id}/start_recipe_run`)
        .set('Authorization', World.current_user.token)
        .catch(result => {

            expect(result).to.have.status(422);

            expect(result.response.body.error).to.equal('There is already recipe run pending approval');

        });

});

Then('the system will display an error about the Market Data not being up to date', function () {

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error.startsWith(
        'No base asset prices in USD for past 15 minutes found!'
    )).to.be.true;

    expect(error.split('\n')[1].startsWith(
        'Missing recent prices. Please wait for new prices to be fetched'
    ), 'Expected to receive an error about missing prices').to.be.true;

});

Then('the system will display an error about missing Instrument Mappings', function () {

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error.startsWith(
        'No base asset prices in USD for past 15 minutes found!'
    )).to.be.true;

    expect(error.split('\n')[1].startsWith(
        'Missing USDT instrument mappings for exchanges:'
    ), 'Expected to receive an error about missing instruments for base assets in USD and USDT').to.be.true;

});

Then('the system will show a detailed error including missing mappings', function() {

    chai.assert.isObject(this.recipe_run_detail_missing_mapping, 'No missing mapping saved in context!');
    chai.assert.isString(this.current_recipe_run_status_change_error, 'No error saved when recipe run status changed!');

    const mapping = this.recipe_run_detail_missing_mapping;
    const error = this.current_recipe_run_status_change_error;
    chai.assert.include(error, mapping.instrument_symbol, `Missing mapping symbol ${mapping.instrument_symbol} not included in error!`);
    chai.assert.include(error, mapping.exchange_name, `Exchange with missing mapping ${mapping.exchange_name} not included in error!`);
})

Then('a new Recipe Run is not created', async function () {

    const {
        RecipeRun
    } = require('../../../models');

    const new_recipe = await RecipeRun.findOne({
        where: {
            investment_run_id: this.current_investment_run.id
        }
    });

    expect(new_recipe).to.be.null;

});