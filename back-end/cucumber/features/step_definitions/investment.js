const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const { lessThanOrEqual } = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there are no investment runs in the system', function() {
    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.destroy({
        where: {}
    });
});

Given('there are no Executing Investment Runs in the system', function() {
    const { InvestmentRun, sequelize } = require('../../../models');
    const { Op } = sequelize;

    return InvestmentRun.destroy({
        where: { 
            is_simulated: false,
            status: { [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled }
        }
    });
});

Given('there are no incomplete non simulated investment runs', function() {

    const { InvestmentRun, sequelize } = require('../../../models');
    const Op = sequelize.Op;
    
    return InvestmentRun.destroy({
        where: {
            is_simulated: false,
            status: {
              [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled
            }
        }
    });
    
});

Given(/there is a (.*) Investment Run created by an Investment Manager/, async function(type) {
    
    const { Asset, InvestmentRun, InvestmentAmount, InvestmentRunAssetGroup, GroupAsset, sequelize } = require('../../../models');
    const { Op } = sequelize;

    let investment_run = await InvestmentRun.findOne({
        where: { 
            user_created_id: World.users.investment_manager.id,
            is_simulated: false,
            strategy_type: STRATEGY_TYPES[type]
        },
        raw: true
    });

    if(investment_run) {
        this.current_investment_run = investment_run;
        this.current_investment_run.amounts = await InvestmentAmount.findAll({
            where: { investment_run_id: investment_run.id }
        });
    }

    const assets = await Asset.findAll({
        where: { 
            [Op.or]: [{ is_deposit: true }, { is_base: true }]
        }   
    });

    const new_investment_run = {
        strategy_type: STRATEGY_TYPES[type],
        is_simulated: false,
        deposit_usd: _.random(1000, 50000, false),
        user_created_id: World.users.investment_manager.id,
        started_timestamp: new Date(),
        updated_timestamp: new Date()
    };

    /**
     * Using unly USD for now, seems Recipe Run does not always allocate the cryptos well
     */
    const new_amounts = assets.map(asset => {
        return {
            amount: asset.symbol === 'USD' ? _.random(1000, 50000, false) : 0,
            asset_id: asset.id
        }
    });
    
    const new_asset_group = {
        created_timestamp: new Date(),
        user_id: World.users.investment_manager.id,
        strategy_type: STRATEGY_TYPES[type]
    };

    /**
     * It's seems the recipe run needs assets to be included in an instrument which is
     * also mapped to atleast one exchange.
     */
    /*
    const [ top_assets ] = await sequelize.query(`
        SELECT Distinct ON(a.id) a.id, cap.capitalization_usd, a.symbol FROM asset AS a
        INNER JOIN LATERAL (
            SELECT DISTINCT ON(cap.asset_id) cap.capitalization_usd, cap.asset_id FROm asset_market_capitalization AS cap
            ORDER BY cap.asset_id, cap.timestamp DESC
        ) AS cap ON a.id = cap.asset_id
        INNER JOIN instrument AS i ON a.id = i.transaction_asset_id
        INNER JOIN instrument_exchange_mapping AS iem ON i.id = iem.instrument_id
        WHERE a.symbol != 'USD'
        ORDER BY a.id, cap.capitalization_usd DESC
        LIMIT ${SYSTEM_SETTINGS.INDEX_LCI_CAP + SYSTEM_SETTINGS.INDEX_MCI_CAP}
    `);
    */
    
    const [ asset_group, group_assets ] = await require('../../../services/InvestmentService').generateInvestmentAssetGroup(World.users.investment_manager.id, STRATEGY_TYPES[type]);

    return sequelize.transaction(transaction => {

        /*return InvestmentRunAssetGroup.create(new_asset_group, { transaction }).then(asset_group => {

            let strategy_assets = [];
            if(asset_group.strategy_type === STRATEGY_TYPES.LCI) strategy_assets = top_assets.slice(0, SYSTEM_SETTINGS.INDEX_LCI_CAP).map(asset => {
                return {
                    asset_id: asset.id,
                    investment_run_asset_group_id: asset_group.id,
                    status: INSTRUMENT_STATUS_CHANGES.Whitelisting
                };
            });
            else strategy_assets = top_assets.slice(SYSTEM_SETTINGS.INDEX_LCI_CAP, SYSTEM_SETTINGS.INDEX_MCI_CAP).map(asset => {
                return {
                    asset_id: asset.id,
                    investment_run_asset_group_id: asset_group.id,
                    status: INSTRUMENT_STATUS_CHANGES.Whitelisting
                };
            });

            new_investment_run.investment_run_asset_group_id = asset_group.id;
            
            return GroupAsset.bulkCreate(strategy_assets, { transaction }).then(group_assets => {
                
                

            });

        });*/
        new_investment_run.investment_run_asset_group_id = asset_group.id;

        return InvestmentRun.create(new_investment_run, { transaction }).then(investment_run => {

            this.current_investment_run = investment_run.toJSON();

            return InvestmentAmount.bulkCreate(new_amounts.map(amount => {
                
                return Object.assign(amount, { investment_run_id: investment_run.id });

            }), { transaction, returning: true }).then(amounts => {

                this.current_investment_run.amounts = amounts.map(amount => amount.toJSON());

            });
        });

    });
});

Given(/^the status of the Investment Run is (.*)$/, function(status) {
    
    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.update({ status: INVESTMENT_RUN_STATUSES[status] }, {
        where: { id: this.current_investment_run.id },
        limit: 1
    }).then(result => {
        this.current_investment_run.status = INVESTMENT_RUN_STATUSES[status];
    });

});

Given('there are real and simulated Executing Investment Runs in the system', async function() {

    const { InvestmentRun, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const base = {
        strategy_type: STRATEGY_TYPES.LCI,
        status: INVESTMENT_RUN_STATUSES.Initiated,
        started_timestamp: new Date(),
        updated_timestamp: new Date(),
        deposit_usd: 0,
        user_created_id: World.users.investment_manager.id
    };

    return Promise.all([
        InvestmentRun.findCreateFind({
            where: {
                status: { [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled },
                is_simulated: false
            },
            defaults: _.assign({ is_simulated: false }, base)
        }),
        InvestmentRun.findCreateFind({
            where: {
                status: { [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled }, 
                is_simulated: true
            },
            defaults: _.assign({ is_simulated: true }, base)
        })
    ]);

});

Given('the Investment Run deposit amounts are as followed:', async function(table) {

    const { InvestmentAmount, Asset, sequelize } = require('../../../models');

    const deposit_amounts = table.hashes();

    const deposit_assets = await Asset.findAll({
        where: { is_deposit: true },
        limit: 3
    });

    return sequelize.transaction(async transaction => {

        const investment_run_id = this.current_investment_run.id;
        expect(investment_run_id).to.be.a('number', 'Expected to have an ID of the current investment run');

        await InvestmentAmount.destroy({
            where: { investment_run_id },
            transaction
        });

        this.current_investment_run_deposit_amounts = await InvestmentAmount.bulkCreate(deposit_amounts.map(da => {

            const asset = deposit_assets.find(a => a.symbol === da.currency.trim());
            expect(asset, `Expected to find Asset with symbol "${da.currency}"`).to.be.not.undefined;

            return {
                amount: da.amount,
                asset_id: asset.id,
                investment_run_id
            };

        }), { transaction, returning: true });

    });

});

Given(/^the Investment Run was (started|updated) on (.*)$/, function(timestamp_type, date_string) {

    const { InvestmentRun } = require('../../../models');

    return InvestmentRun.update({
        [`${timestamp_type}_timestamp`]: Date.parse(date_string)
    }, {
        where: { id: this.current_investment_run.id }
    });

});

When(/^I generate a new (.*) strategy Asset Mix$/, function(strategy) {

    return chai
        .request(this.app)
        .post('/v1/investments/select_assets')
        .set('Authorization', World.current_user.token)
        .send({ strategy_type: STRATEGY_TYPES[strategy] })
        .then(result => {   
            
            expect(result).to.have.status(200);
            
            this.current_asset_mix = result.body.list;

            if(this.current_investment_run_details) this.current_investment_run_details.investment_group_asset_id = result.body.list.id;

        });

});

When(/^I select to create a new (.*) Investment Run$/, function(strategy_type) {

    this.current_investment_run_details = {
        strategy_type: STRATEGY_TYPES[strategy_type],
        is_simulated: false
    };

});

When('I confirm the new Investment Run', function() {
    
    return chai
        .request(this.app)
        .post('/v1/investments/create')
        .set('Authorization', World.current_user.token)
        .send(this.current_investment_run_details)
        .then(result => {   
            
            expect(result).to.have.status(200);
            
            this.current_investment_run = result.body.investment_run;
        });
});

When('I enter the investment amounts in USD, BTC and ETH', function() {

    this.current_investment_run_details.deposit_amounts = [
        {
            symbol: 'USD',
            amount: _.random(1000, 100000, false)
        },
        {
            symbol: 'BTC',
            amount: _.random(0.1, 5, true)
        },
        {
            symbol: 'ETH',
            amount: _.random(10, 100, true)
        }
    ];

});

When('I get the Investment Run by id', function() {
    return chai
        .request(this.app)
        .get(`/v1/investments/${this.current_investment_run.id}`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
            
            expect(result).to.have.status(200);

            this.current_investment_run = result.body.investment_run;
        });
});

When(/^I attempt to create a new Investment Run with invalid values: (.*), (.*), (.*)$/, function(strategy_type, is_simulated, deposit_amounts) {
    
    strategy_type = STRATEGY_TYPES[strategy_type] || -1;
    is_simulated = ['true', 'false'].includes(is_simulated) ? Boolean(is_simulated) : is_simulated;
    deposit_amounts = deposit_amounts.split(',').map(dep_amount => {
        const [symbol, amount] = dep_amount.split('=');
        return { symbol, amount: Number(amount) }
    })

    const invalid_investment_run_details = {
        strategy_type, is_simulated, deposit_amounts
    };

    return chai
        .request(this.app)
        .post('/v1/investments/create')
        .set('Authorization', World.current_user.token)
        .send(invalid_investment_run_details)
        .catch(result => {   
            
            expect(result).to.have.status(422);
            
            this.current_response = result;
        });

});

When('I fetch the details of the Investment Run', async  function() {

    const investment_run_id = this.current_investment_run.id;
    expect(investment_run_id).to.be.a('number', 'Expected to have an investment id of the current Investment Run');

    const [ investment_run_details, investement_run_deposits ] = await Promise.all([
        chai
        .request(this.app)
        .post(`/v1/investments/${investment_run_id}`)
        .set('Authorization', World.current_user.token)
        .send({
            order: [ { by: 'capitalization', order: 'desc' } ]
        }),
        chai
        .request(this.app)
        .post(`/v1/investments/${investment_run_id}/deposit_amounts`)
        .set('Authorization', World.current_user.token)
    ]);

    this.current_investment_run_details = investment_run_details.body.investment_run;
    this.current_asset_mix_list = investment_run_details.body.asset_mix;
    this.current_asset_mix_footer = investment_run_details.body.footer;

    this.current_investment_run_deposit_list = investement_run_deposits.body.deposit_amounts;
    this.current_investment_run_deposit_footer = investement_run_deposits.body.footer;

});

When('I fetch the timeline of the current Investment Run', function() {

    expect(this.current_investment_run, `Expected to have a current Investment Run`).to.be.not.undefined;

    return chai
        .request(this.app)
        .post(`/v1/investments/timeline`)
        .set('Authorization', World.current_user.token)
        .send({ investment_run_id: this.current_investment_run.id })
        .then(result => {

            expect(result).to.has.status(200);

            expect(result.body.timeline).to.be.an('object', 'Expected to find a timeline object in the response body');

            this.current_timeline = result.body.timeline;
            
        });

});

Then('a new Investment Run is created with the status Initiated', async function() {

    const { InvestmentRun, InvestmentAmount, Asset } = require('../../../models');

    return InvestmentRun.findById(this.current_investment_run.id).then(investment_run => {

        expect(investment_run, 'Expected to find a new investment run in the database').to.be.not.null;

        //Compare the object from the database with one sent to the API
        expect(investment_run.strategy_type).to.equal(this.current_investment_run_details.strategy_type, 'Expected the investment run strategy type to match the provided one');

        expect(investment_run.is_simulated).to.equal(this.current_investment_run_details.is_simulated, 'Expected the investment run is simulated flag to match the provided one');
        
        expect(investment_run.started_timestamp).to.be.a('date', 'Expected the investment run strategy started timestamp to be a date');
        expect(investment_run.updated_timestamp).to.be.a('date', 'Expected the investment run strategy updated timestamp to be a date');
        expect(investment_run.completed_timestamp, 'Expected the investment run strategy completed timestamp to be  not set').to.be.null;

        this.current_investment_run = investment_run;

    });

});

Then(/the Investment Run status is (.*)/, function(status) {

    expect(this.current_investment_run.status).to.equal(INVESTMENT_RUN_STATUSES[status], 'Expected a certain investment run status');

});

Then('I am assigned to it as the creator', function() {

    expect(this.current_investment_run.user_created_id).to.equal(World.current_user.id, 'Expected the user created on the investment run to equal the currently logged in user');

});

Then('the entered investment amounts are saved along with it', async function() {

    const { InvestmentAmount, Asset } = require('../../../models');

    const assets = await Asset.findAll({
        where: { symbol: ['USD', 'BTC', 'ETH'] },
        raw: true
    });

    return InvestmentAmount.findAll({
        where: { investment_run_id: this.current_investment_run.id }
    }).then(investment_amounts => {

        for(let amount of investment_amounts) {

            const found_amount = this.current_investment_run_details.deposit_amounts.find(a => {
                const asset_by_symbol = assets.find(asset => asset.symbol === a.symbol);
                return asset_by_symbol.id === amount.asset_id;
            });

            expect(found_amount, 'Expected to find a matching investment amount').to.be.not.undefined;
            expect(parseFloat(amount.amount)).to.equal(parseFloat(found_amount.amount), 'Expected the investment amount to match with the provided one');

        };

    });

});

Then(/^the Asset Mix is assigned to it with appropriate (.*) assets$/, function(strategy_type) {

    const { InvestmentRunAssetGroup, GroupAsset } = require('../../../models');

    expect(this.current_investment_run.investment_run_asset_group_id).to.be.not.null;

    return InvestmentRunAssetGroup.findById(this.current_investment_run.investment_run_asset_group_id, {
        include: GroupAsset
    }).then(asset_mix => {

        expect(asset_mix, 'Expected to find an Asset mix').to.be.not.null;

        expect(asset_mix.strategy_type).to.equal(STRATEGY_TYPES[strategy_type], 'Expected the investment run and asset mix strategy type to match');
        expect(this.current_investment_run.strategy_type).to.equal(asset_mix.strategy_type);

        const whitelisted_assets = asset_mix.GroupAssets.filter(a => a.status === INSTRUMENT_STATUS_CHANGES.Whitelisting);

        if(strategy_type === 'LCI') expect(whitelisted_assets.length).to.equal(SYSTEM_SETTINGS.INDEX_LCI_CAP, `Expected the asset mix size to equal the LCI index of ${SYSTEM_SETTINGS.INDEX_LCI_CAP}`);
        else expect(whitelisted_assets.length).to.equal(SYSTEM_SETTINGS.INDEX_MCI_CAP, `Expected the asset mix size to equal the MCI index of ${SYSTEM_SETTINGS.INDEX_MCI_CAP}`);

    });

});

Then('the system will not allow me to create another Investment Run', function() {

    return chai
        .request(this.app)
        .post('/v1/investments/create')
        .set('Authorization', World.current_user.token)
        .send(this.current_investment_run_details)
        .catch(result => {   
            
            expect(result).to.have.status(422);
            expect(result.response.body.error).to.equal('Investment run cannot be initiated as other investment runs are still in progress', 'Expected an error associated to not be able to initiate another investement run');

        });

});

Then('I should see the Investment Run information', function() {

    expect(this.current_investment_run).to.be.an('object');

    ['id', 'started_timestamp', 'updated_timestamp', 'completed_timestamp', 'strategy_type', 'is_simulated', 'status', 'deposit_usd', 'user_created']
        .map(field => {
            expect(this.current_investment_run[field], `Was not able to get the field "${field}" in the investment run object`).to.be.not.undefined;
        });
});

Then('the creators full name should match', function() {

    const full_name = `${World.users.investment_manager.first_name} ${World.users.investment_manager.last_name}`;

    expect(this.current_investment_run.user_created).to.equal(full_name, 'Expected the full names to match');

});

Then('the Investment Run is marked as simulated', function() {

    expect(this.current_investment_run.is_simulated).to.be.true;

});

Then('I should be blocked by the system for not having the right permissions', function() {

    expect(this.error).to.have.status(403);

});

Then('the system will display Investment Run validation error', function() {

    const error = this.current_response.response.body.error;

    if(error.type) expect(error.type).to.equal('validator_errors', 'Expected to get a validation error');
    else expect(error).to.be.a('string');

});

Then('the system does not create a new Investment Run', async function() {

    const { InvestmentRun } = require('../../../models');

    const new_initiated_investment_runs = await InvestmentRun.count({
        where: { status: INVESTMENT_RUN_STATUSES.Initiated, is_simulated: false }
    });

    expect(new_initiated_investment_runs).to.equal(0, 'Expected not to find new Investment runs');

});

Then('the new Asset Mix is saved to the database', async function() {

    const { Asset, GroupAsset, InvestmentRunAssetGroup } = require('../../../models');

    const asset_mix = await InvestmentRunAssetGroup.findById(this.current_asset_mix.id, {
        include: {
            model: GroupAsset,
            include: Asset
        }
    });

    expect(asset_mix, `Expected to find an Asset Mix with id "${this.current_asset_mix.id}"`).to.be.not.null;

    this.current_asset_mix = asset_mix;

});

Then(/^the size of the Asset Mix will be (\d*)$/, function(size) {

    size = parseInt(size);

    const whitelisted = this.current_asset_mix.GroupAssets.filter(a => a.status === INSTRUMENT_STATUS_CHANGES.Whitelisting)

    expect(whitelisted.length).to.equal(size, 'Expected the Asset Mix size to match');

});

Then(/^Assets are selected from (\w*) to (\w*) inclusively$/, async function(starting_symbol, ending_symbol) {

    const data_list = this.current_asset_data;
    const list_start = data_list.findIndex(data => data.asset === starting_symbol);
    const list_end = data_list.findIndex(data => data.asset === ending_symbol);
    
    const cropped_list = data_list.slice(list_start, list_end + 1); 
    expect(cropped_list.length).to.equal(this.current_asset_mix.GroupAssets.length, 'Expected the cropped asset list length to match the asset mix length');

    for(let data of cropped_list) {

        const matching_data = this.current_asset_mix.GroupAssets.find(asset => data.asset === asset.Asset.symbol);

        expect(matching_data, `Expected to find matching data from asset ${data.asset}`).to.be.not.undefined;

    };

    this.current_strategy_asset_data = cropped_list;

});

Then(/^Blacklisted Assets (.*) will be ignored$/, function(asset_string) {

    const asset_symbols = asset_string.split(',').map(a => a.trim());

    for(let symbol of asset_symbols) {

        const matching_asset = this.current_asset_mix.GroupAssets.find(a => a.Asset.symbol === symbol);

        if(matching_asset) {
            expect(matching_asset, `Expected to find a matching Asset in the Mix with a symbol ${symbol}`).to.be.not.undefined;
            expect(matching_asset.status).to.equal(INSTRUMENT_STATUS_CHANGES.Blacklisting);
        }
        
    };

});

Then(/^(\w*) will remain unchanged in the Asset Mix$/, async function(asset_symbol) {

    const { Asset, GroupAsset } = require('../../../models');

    const group_asset = await GroupAsset.findOne({
        where: {
            investment_run_asset_group_id: this.current_asset_mix.id
        },
        include: {
            model: Asset,
            where: { symbol: asset_symbol },
            required: true
        }
    });

    expect(group_asset, `Expected to find Group Asset ${asset_symbol} in the current Asset Mix`).to.be.not.null;

    expect(group_asset.status).to.equal(INSTRUMENT_STATUS_CHANGES.Whitelisting);

});

Then(/^generating a new (LCI|MCI) Asset Mix, (\w*) will be ignored$/, async function(strategy, asset_symbol) {

    const { Asset, GroupAsset } = require('../../../models');

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    expect(asset, `Expected to find Asset with symbol ${asset_symbol}`).to.be.not.null;

    return chai
        .request(this.app)
        .post('/v1/investments/select_assets')
        .set('Authorization', World.current_user.token)
        .send({ strategy_type: STRATEGY_TYPES[strategy] })
        .then(async result => {   
            
            expect(result).to.have.status(200);
            
            const group_asset = await GroupAsset.findOne({
                where: {
                    asset_id: asset.id,
                    investment_run_asset_group_id: result.body.list.id
                }
            });

            expect(group_asset, `Expected to find Group Asset with symbol ${asset_symbol}`).to.be.not.null;
            expect(group_asset.status, `Expected Group Asset ${asset_symbol}, to be Blacklisted`).to.equal(INSTRUMENT_STATUS_CHANGES.Blacklisting);

        });

});