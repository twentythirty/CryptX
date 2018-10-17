const {
    Given,
    When,
    Then
} = require('cucumber');
const chai = require('chai');
const {
    expect
} = chai;
const sinon = require('sinon');

const {
    nullOrNumber,
    nullOrSpecificNumber
} = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const request_promise = require('request-promise');

const World = require('../support/global_world');
const utils = require('../support/step_helpers');

const coin_market_cap_url = 'https://api.coinmarketcap.com/v2';

Given('the system has no Asset market history', function () {

    const {
        AssetMarketCapitalization
    } = require('../../../models');

    return AssetMarketCapitalization.destroy({
        where: {}
    });

});

Given('the system has Assets', async function () {

    const {
        Asset
    } = require('../../../models');

    const asset_count = await Asset.count();

    expect(asset_count).to.be.greaterThan(0, 'Expected to have assets in the database');

});

Given('the system has only WhiteListed Assets', function () {

    const {
        AssetStatusChange
    } = require('../../../models');

    return AssetStatusChange.destroy({
        where: {}
    });

});

Given(/^the system has some (.*) Assets$/, async function(type) {

    const type_map = {
        Blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylisted: INSTRUMENT_STATUS_CHANGES.Graylisting
    };

    const { Asset, AssetStatusChange, sequelize } = require('../../../models');

    const amount = _.random(2, 5, false);

    let assets = await sequelize.query(queryAssetByType(type_map[type], amount), { model: Asset });

    if(assets.length === amount) return;
 
    assets = await Asset.findAllMapped(amount);

    return AssetStatusChange.bulkCreate(assets.map(asset => {
        return {
            asset_id: asset.id,
            comment: type,
            user_id: World.users.compliance_manager.id,
            timestamp: Date.now(),
            type: type_map[type]
        };
    }));

});

Given(/^the system has Asset Market Capitalization for the last (.*) (hours|days)$/, {
    timeout: 15000
}, async function (interval, interval_type) {

    interval = parseInt(interval);

    const now = new Date();

    const {
        Asset,
        AssetMarketCapitalization,
        sequelize
    } = require('../../../models');
    const {
        Op
    } = sequelize;

    const intervals = [];

    for (let i = 0; i <= interval; i++) {

        const new_time = new Date(now);

        switch(interval_type) {

            case 'days':
                new_time.setDate(now.getDate() - i);
                break;

            case 'hours':
            default:
                new_time.setHours(now.getHours() - i);
                break;

        };
        
        intervals.unshift(new_time);

    }

    const assets = await Asset.findAllMapped();

    const current_capitalization = await AssetMarketCapitalization.count({
        where: {
            timestamp: {
                [Op.gte]: intervals[0].getTime() - 60000 //Add a safety minute
            }
        },
        distinct: true,
        col: 'asset_id'
    });

    if (assets.length === current_capitalization) return;

    let market_cap = _.concat(...intervals.map(int => {
        let total_cap = 0;

        let base_capitalization = assets.map(asset => {
            const capitalization = _.random(10000, 100000000, false);
            total_cap += capitalization;

            return {
                timestamp: int,
                capitalization_usd: capitalization,
                asset_id: asset.id
            };
        });

        base_capitalization.map(cap => {

            cap.market_share_percentage = (cap.capitalization_usd * 100) / total_cap;
            cap.daily_volume_usd = ((cap.capitalization_usd * (cap.market_share_percentage)) / _.random(10, 100));

        });

        return base_capitalization;
    }));

    return sequelize.transaction(transaction => {
        return AssetMarketCapitalization.destroy({
            where: {
                timestamp: {
                    [Op.lte]: intervals[0].getTime() - 60000
                }
            },
            transaction
        }).then(() => {
            return AssetMarketCapitalization.bulkCreate(market_cap, { transaction });
        });
    });

});

Given(/^some Assets only have Market Capitalization for the last (.*) (hours|days)$/, async function(interval, interval_type) {

    interval = parseInt(interval);

    const since = new Date();

    const { Asset, AssetMarketCapitalization, sequelize } = require('../../../models');
    const { Op } = sequelize;

    switch(interval_type) {

        case 'days':
            since.setDate(since.getDate() - interval);
            break;

        case 'hours':
        default:
            since.setHours(since.getHours() - interval);
            break;

    };
    since.setHours(23, 59, 59);

    const assets = await Asset.findAll({
        where: {},
        raw: true,
        limit: _.random(10, 20, false),
        order: sequelize.literal('random()')
    });

    this.current_assets = assets;

    return AssetMarketCapitalization.destroy({
        where: {
            asset_id: assets.map(a => a.id),
            timestamp: {
                [Op.lte]: since
            }
        }
    });

});

Given('the system has updated the Market History Calculation', async function() {

    const { Asset, MarketHistoryCalculation, sequelize } = require('../../../models');
    const { Op } = sequelize;
    

    const one_day_ago = new Date();
    one_day_ago.setDate(one_day_ago.getDate() - 1); 

    const [ asset_count, calculation_count ] = await Promise.all([
        Asset.count(),
        MarketHistoryCalculation.count({
            where: { timestamp: { [Op.gte]: one_day_ago } },
            distinct: true,
            col: 'MarketHistoryCalculation.asset_id'
        })
    ]);

    if(asset_count === calculation_count) return;

    const [ nvt ] = await sequelize.query(`
        SELECT asset_id, avg(capitalization_usd / daily_volume_usd) AS nvt
        FROM asset_market_capitalization
        WHERE TIMESTAMP > NOW() - interval '1 day'
        GROUP BY asset_id
    `);

    return MarketHistoryCalculation.bulkCreate(nvt.map(asset => {
        return {
            asset_id: asset.asset_id,
            value: asset.nvt,
            timestamp: new Date(),
            type: MARKET_HISTORY_CALCULATION_TYPES.NVT
        }
    }));

});

Given('the system does not have Market History Calculations', function() {

    const { MarketHistoryCalculation } = require('../../../models');

    return MarketHistoryCalculation.destroy({ where: { } });

});

Given('the system has some missing Assets from CoinMarketCap, including ETH and BTC', async function() {

    const {
        Asset,
        AssetBlockchain,
        sequelize
    } = require('../../../models');
    const {
        Op
    } = sequelize;

    await Asset.destroy({
        where: {
            symbol: ['ETH, BTC']
        }
    });

    const asset_count = await AssetBlockchain.count({});

    /**
     * This is probably the most efficient way to remove random assets from Coin Martket Cap
     * For now, lets delete around 5%
     */
    await sequelize.query(`
        DELETE FROM asset
        WHERE asset.id IN (
            SELECT bc.asset_id
            FROM asset_blockchain AS bc
            ORDER By random()
            LIMIT ${_.round(asset_count/20) || 1}
        )
    `);

});

Given('the system is missing some of the top 100 coins', function () {

    const {
        AssetBlockchain,
        sequelize
    } = require('../../../models');

    return chai
        .request(coin_market_cap_url)
        .get('/ticker')
        .then(async result => {

            expect(result).to.have.status(200);
            expect(result.body.data).to.be.an('object');

            const ids = _.shuffle(Object.keys(result.body.data)).splice(0, 20).map(id => `\'${id}\'`);

            await sequelize.query(`
                DELETE FROM asset
                WHERE asset.id IN (
                    SELECT bc.asset_id
                    FROM asset_blockchain AS bc
                    WHERE bc.coinmarketcap_identifier IN (${ids.join(', ')})
                )
            `);

            this.current_asset_count = await AssetBlockchain.count();

        });
});

Given(/^the user has (.*) the asset with rationale "(.*)" on (.*)$/, async function(new_status_word, status_rationale, timestamp_text) {

    chai.assert.isObject(this.current_asset, `Context did not contain current asset for this step!`);
    this.current_user = World.users.investment_manager;
    chai.assert.isObject(this.current_user, `Context did not contain current user for this step!`);

    const timestamp = new Date(timestamp_text);
    chai.assert.notEqual(timestamp.toString(), 'Invalid Date', `The timestamp texxt ${timestamp_text} did not create a valid date!`);
    chai.assert.isObject(this.i18n, `Context missing internationalization object!`);
    chai.assert.isObject(this.i18n.assets.status, `Internationalization object on context missing assets statuses!`);
    const i18n_asset_status = _.invert(this.i18n.assets.status);
    const new_status = parseInt(i18n_asset_status[new_status_word]);
    chai.assert.isNotNaN(new_status, `Status word ${new_status_word} did not produce a status constant for asset!`);
    chai.assert.isAbove(status_rationale.length, 0, `Rationale shouldnt be empty!`);

    await require('../../../models').AssetStatusChange.create({
        timestamp,
        comment: status_rationale,
        type: new_status,
        asset_id: this.current_asset.id,
        user_id: this.current_user.id
    });
});

Given(/^the average Market Capitalization of (\w*) for the last (\d*) (hours|days) is (\d*) USD$/, async function(asset_symbol, interval, interval_type, capital) {

    interval = parseInt(interval);
    capital = parseInt(capital);
    const fuzzyness = capital/100;

    const now = new Date();

    const { Asset, AssetMarketCapitalization, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const intervals = [];

    for (let i = 0; i < interval; i++) {

        let new_capitalization = capital;

        if(i === interval - 1) {

            const current_total = intervals.reduce((acc, interval) => acc += interval.capitalization, 0);
            const expected_sum = capital * interval;
            new_capitalization = expected_sum - current_total;

        }

        else new_capitalization = capital + _.random(-fuzzyness, fuzzyness); 

        const new_time = new Date(now);

        switch(interval_type) {

            case 'days':
                new_time.setDate(now.getDate() - i);
                break;

            case 'hours':
            default:
                new_time.setHours(now.getHours() - i);
                break;

        };
        
        intervals.unshift({
            date: new_time,
            capitalization: new_capitalization
        });

    }

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    expect(asset, `Expected to find Asset with symbol ${asset_symbol}`).to.be.not.null;

    let capitalizations = intervals.map(i => {
        return {
            timestamp: i.date,
            asset_id: asset.id,
            capitalization_usd: i.capitalization,
            market_share_percentage: _.random(0.01, 40, true), //Unless required, will remain random
            daily_volume_usd: i.capitalization / _.random(90, 98) 
        };
    });

    capitalizations = await sequelize.transaction(transaction => {
        return AssetMarketCapitalization.destroy({
            where: {
                timestamp: {
                    [Op.gte]: intervals[interval - 1].date.getTime() - 60000
                },
                asset_id: asset.id
            },
            transaction
        }).then(() => {
            return AssetMarketCapitalization.bulkCreate(capitalizations, { transaction, returning: true });
        });
    });

});

Given(/^the daily volume of (\w*) is consistently (\d*) USD$/, async function(asset_symbol, daily_volume_usd) {

    const { Asset, AssetMarketCapitalization } = require('../../../models');

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    return AssetMarketCapitalization.update({ daily_volume_usd }, {
        where: { asset_id: asset.id }
    });

});

Given(/^the Market Capitalization for (\w*) is as follows:$/, async function(asset_symbol, table) {

    const { Asset, AssetMarketCapitalization, sequelize } = require('../../../models');

    const capitalizations_in_days = table.hashes();
    const entries_per_day = 4;

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    expect(asset, `Expected to find Asset with symbol ${asset_symbol}`).to.be.not.null;

    const capitalizations = [];

    for(let day of capitalizations_in_days) {
        const start_time = new Date();

        start_time.setDate(start_time.getDate() - (capitalizations_in_days.length + 1 - (parseInt(day.day)))); // extra one so that it starts at 0 AKA today
        start_time.setHours(0, 0, 0, 0);
        
        let current_entry = 1;
        while(current_entry <= entries_per_day) {
            current_entry++;
 
            capitalizations.push({
                timestamp: start_time.getTime(),
                asset_id: asset.id,
                capitalization_usd: day.capitalization_usd,
                daily_volume_usd: day.daily_volume_usd,
                market_share_percentage: day.market_share
            });

            start_time.setHours(start_time.getHours() + 2);
        }

    }

    return sequelize.transaction(transaction => {
        return AssetMarketCapitalization.destroy({
            where: {
                asset_id: asset.id
            },
            transaction
        }).then(() => {
            return AssetMarketCapitalization.bulkCreate(capitalizations, { transaction });
        });
    });

});

Given(/^the system does not have Asset Market Capitalization for the last (.*) minutes$/, async function(minutes) {

    minutes = parseInt(minutes);

    const start_time = new Date();
    start_time.setMinutes(start_time.getMinutes() - minutes);

    const { AssetMarketCapitalization, sequelize } = require('../../../models');
    const { Op } = sequelize;

    return AssetMarketCapitalization.destroy({
        where: {
            timestamp: { [Op.gte]: start_time }
        }
    });

});

Given('the current Asset Capitalization is as follows:', async function(table) {

    const { Asset, AssetMarketCapitalization, MarketHistoryCalculation, sequelize } = require('../../../models');

    const asset_data = table.hashes();

    this.current_asset_data = asset_data;

    const assets = await Asset.findAll({
        where: {},
        raw: true
    });
    
    const nvt = [];
    const capitalizations = asset_data.map(data => {

        const asset = assets.find(a => a.symbol === data.asset.trim() && a.long_name === data.name.trim());

        expect(asset, `Expected to find asset ${data.asset}, ${data.name}`).to.be.not.undefined;

        if(data.nvt) {
            nvt.push({
                timestamp: Date.now(),
                asset_id: asset.id,
                type: MARKET_HISTORY_CALCULATION_TYPES.NVT,
                value: data.nvt
            });
        }

        return {
            timestamp: Date.now(),
            asset_id: asset.id,
            capitalization_usd: data.capitalization_usd,
            daily_volume_usd: _.random(1, 1000),
            market_share_percentage: data.market_share
        };

    });

    await sequelize.transaction(async transaction => {
        await AssetMarketCapitalization.destroy({
            where: {},
            transaction
        });

        await AssetMarketCapitalization.bulkCreate(capitalizations, { transaction });

        if(!nvt.length) return;

        await MarketHistoryCalculation.destroy({
            where: {},
            transaction
        });

        await MarketHistoryCalculation.bulkCreate(nvt, { transaction });
    });

});

Given(/^the (Assets|Asset) (.*) (are|is) Blacklisted$/, async function(plural_1, blacklisted_assets, plural_2) {

    const { Asset, AssetStatusChange } = require('../../../models');
    
    const asset_symbols = blacklisted_assets.split(',').map(a => a.trim());

    const to_blacklist = await Asset.findAll({
        where: { symbol: asset_symbols }
    });

    return AssetStatusChange.bulkCreate(to_blacklist.map(asset => {
        return {
            asset_id: asset.id,
            comment: 'blacklisted',
            timestamp: Date.now(),
            type: INSTRUMENT_STATUS_CHANGES.Blacklisting
        };
    }));
});

Given(/there is a (.*) asset called "(.*)" with the symbol "(.*)"/, async function(asset_type, asset_long_name, asset_symbol) {

    const is_crypto = asset_type == 'crypto';
    const { Asset, AssetBlockchain } = require('../../../models');

    let existing_asset = await Asset.findOne({
        where: {
            symbol: asset_symbol,
            long_name: asset_long_name
        }
    });
    
    if (existing_asset == null) {
        //asset itself missing, lets add asset!
        existing_asset = await Asset.create({
            symbol: asset_symbol,
            long_name: asset_long_name,
            is_deposit: false,
            is_base: false
        })
    }
    //check blockchain requirement
    if (is_crypto) {
        const blockchain = await AssetBlockchain.findOne({
            where: {
                asset_id: existing_asset.id
            }
        });
        if (blockchain == null) {
            //missing blockchain, lets add it
            await AssetBlockchain.create({
                asset_id: existing_asset.id,
                coinmarketcap_identifier: 'CUCUMBER'
            })
        }
    }
    //set asset as scenario context
    this.current_asset = existing_asset;
});

async function remove_context_asset_data(data_model) {

    chai.assert.isObject(this.current_asset, 'Context should have asset for this step!');
    const model = require('../../../models')[data_model];
    chai.assert.isNotNull(model, `No data model found for term ${data_model}`);

    await model.destroy({
        where: {
            asset_id: this.current_asset.id
        }
    });

}

Given('the asset has no status change history', async function() {

    await remove_context_asset_data.bind(this)('AssetStatusChange');
});
Given('the asset has no known capitalization', async function() {

    await remove_context_asset_data.bind(this)('AssetMarketCapitalization');
});
Given('the asset has no known market history calculations', async function() {

    await remove_context_asset_data.bind(this)('MarketHistoryCalculation');
});


Given(/the asset had capitalization of (.*) USD and market share of (.*)% recorded on (.*)/, async function(capitalization_text, market_share_text, timestamp_text) {

    chai.assert.isNotNull(this.current_asset, 'Context should have asset for this step!');

    const capitalization_usd = parseFloat(capitalization_text);
    const market_share_percentage = parseFloat(market_share_text);
    [capitalization_usd, market_share_percentage].forEach(datum => {
        chai.assert.isAtLeast(datum, 0, `The parsed value ${datum} was supposed ot be positive or 0!`);
    })
    const timestamp = new Date(timestamp_text);
    chai.assert.notEqual(timestamp.toString(), 'Invalid Date', `The provided timestamp text ${timestamp_text} did not resolve to a valid date!`);

    const { AssetMarketCapitalization } = require('../../../models');

    await AssetMarketCapitalization.create({
        timestamp,
        capitalization_usd,
        asset_id: this.current_asset.id,
        //can be random since irrelevant to view
        daily_volume_usd: _.random(0, capitalization_usd, true),
        market_share_percentage,
    });
});

Given(/the asset had NVT value of (.*) calculated/, async function(nvt_text) {

    chai.assert.isNotNull(this.current_asset, 'Context should have asset for this step!');

    const nvt_value = parseFloat(nvt_text);
    chai.assert.isAtLeast(nvt_value, 0.0, `Parsed nvt text ${nvt_text} was not a non-negative value!`);

    const { MarketHistoryCalculation } = require('../../../models');

    await MarketHistoryCalculation.create({
        timestamp: new Date(),
        type: MARKET_HISTORY_CALCULATION_TYPES.NVT,
        value: nvt_value,
        asset_id: this.current_asset.id
    });
});

When('retrieve a list of Assets', function() {

    return chai
        .request(this.app)
        .post('/v1/assets/detailed/all')
        .set('Authorization', World.current_user.token)
        .then(result => {

            expect(result).to.have.status(200);
            expect(result.body.assets.length).to.be.greaterThan(0);

            this.current_assets = result.body.assets;

        });

});

When(/^I select a (Blacklisted|Whitelisted|Greylisted) Asset$/, async function(type) {

    const type_map = {
        Blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylisted: INSTRUMENT_STATUS_CHANGES.Graylisting
    };

    const { Asset, AssetStatusChange, sequelize } = require('../../../models');

    const [ asset ] = await sequelize.query(queryAssetByType(type_map[type], 1), { model: Asset })

    expect(asset, 'Expected to find a Greylisted asset').to.be.not.undefined;

    this.current_asset = asset;

});

When(/^I (Blacklist|Whitelist|Greylist|Degreylist) (the|an|any) Asset$/, async function (action, pointer) {

    const action_map = {
        Blacklist: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelist: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylist: INSTRUMENT_STATUS_CHANGES.Graylisting,
        Degreylist: INSTRUMENT_STATUS_CHANGES.Whitelisting
    };

    const status = action_map[action];

    const {
        Asset
    } = require('../../../models');

    let asset;

    switch(pointer) {

        case 'the':
            asset = this.current_asset;
            break;

        case 'an':
        case 'any':
        default: 
            [ asset ] = await Asset.findAllMapped(1);
            this.current_asset = asset;
            break;

    }

    this.current_action = status;
    
    return chai
        .request(this.app)
        .post(`/v1/assets/${asset.id}/change_status`)
        .set('Authorization', World.current_user.token)
        .send({
            comment: this.current_rationale,
            type: status
        })
        .then(result => {

            expect(result).to.have.status(200);
            expect(result.body.status).to.be.an('object', 'Expected to have a status change object inside the body response');

            this.current_response = result;
        })
        .catch(error => {

            this.current_response = error;

        });

});

When('I select different Assets as quote and transaction assets', async function () {

    const {
        Asset
    } = require('../../../models');

    const assets = await Asset.findAll({
        raw: true
    });

    this.current_assets = [];

    const divide = Math.round(assets.length / 2);
    this.current_assets.push(assets[_.random(0, divide)]);
    this.current_assets.push(assets[_.random(divide + 1, assets.length - 1)]);

    this.current_quote_asset = this.current_assets[0];
    this.current_transaction_asset = this.current_assets[1];

});

When('I select the same Asset as quote and transaction asset', async function() {

    const {
        Asset
    } = require('../../../models');

    const assets = await Asset.findAll({
        raw: true
    });

    this.current_assets = [];

    const random_id = _.random(0, assets.length - 1);
    this.current_assets.push(assets[random_id]);
    this.current_assets.push(assets[random_id]);

    this.current_quote_asset = this.current_assets[0];
    this.current_transaction_asset = this.current_assets[1];

});

When('the system completes the task "synchronize coins list"', {
    timeout: 750000
}, function () {

    return chai
        .request(coin_market_cap_url)
        .get(`/listings`)
        .then(async result => {

            expect(result).to.have.status(200);
            expect(result.body.data.length).to.be.greaterThan(0);

            this.current_coin_market_cap_response = result.body;

            /**
             * The idea here is to "cache" the response so that when the job runs, it will receive the exact same response, as the test step.
             * While the chance of the job having a different response is very small (like REALLY small), better be safe than have the test fail for no good reason.
             */
            sinon.stub(request_promise, 'get').callsFake(options => {
                return Promise.resolve(result.body);
            });

            await utils.finishJobByDescription('synchronize coins list');

            request_promise.get.restore();

        });


});

When('the system completes the task "fetch asset market capitalization"', {
    timeout: 50000
}, async function () {

    const job = require('../../../jobs/market-history-fetcher');
    const models = require('../../../models');
    const config = {
        models
    };

    // Same retrieve and stub trick here
    const request_results = {
        '/global/': {}
    };

    const chunks = Math.floor(job.TOP_N / job.LIMIT);
    if (job.TOP_N % job.LIMIT) chunks++

    for (let i = 0; i < chunks; i++) request_results[`/ticker/?start=${1 + i * job.LIMIT}&limit=${job.LIMIT}`] = {};

    await Promise.all(_.map(request_results, (emptiness, endpoint) => {

        return chai
            .request(coin_market_cap_url)
            .get(endpoint)
            .then(result => {

                expect(result).to.have.status(200);

                request_results[endpoint] = result.body;

            });

    }));

    this.current_coin_market_cap_responses = request_results;

    sinon.stub(request_promise, 'get').callsFake(options => {

        const response = request_results[options.uri.split('v2')[1]];

        return Promise.resolve(response);

    });

    await job.JOB_BODY(config, console.log);

});

When(/^I select a (non-cryptocurrency|cryptocurrency) Asset$/, async function(asset_type) {

    const is_crypto = (asset_type === 'cryptocurrency');

    const { Asset, sequelize } = require('../../../models');
    const { Op } = sequelize;
    const non_cryptos = ['USD'];

    let where = {
        symbol: { [Op.notIn]: non_cryptos }
    };
    if(!is_crypto) where = { symbol: non_cryptos };

    const asset = await Asset.findOne({ 
        where,
        order: sequelize.literal('random()')
    });

    expect(asset, `Expected to find a ${asset_type} Asset`).to.be.not.null;

    this.current_asset = asset;

});

Then('the list should have all of the Assets revelant information if it is available', function () {

    const assets = this.current_assets;

    for (let asset of assets) {

        expect(asset.id).to.be.a('number', 'Expected asset id to be a number');
        expect(asset.symbol).to.be.a('string', 'Expected asset symbol to be a string');
        expect(asset.long_name).to.be.a('string', 'Expected asset long name to be a string');
        expect(asset.is_base).oneOf(['assets.is_base.yes', 'assets.is_base.no'], 'Expected asset is_base to be a "yes" or "no"');
        expect(asset.is_deposit).oneOf(['assets.is_deposit.no', 'assets.is_deposit.yes'], 'Expected asset is_deposit to be a "yes" or "no"');
        expect(asset.is_cryptocurrency).oneOf(['assets.is_cryptocurrency.no', 'assets.is_cryptocurrency.yes'], 'Expected asset is_cryptocurrency to be a "yes" or "no"');
        expect(asset.capitalization).satisfy(nullOrNumber, 'Expected asset capitalization to be a number or a null');
        expect(asset.nvt_ratio).satisfy(nullOrNumber, 'Expected asset NVT ratio to be a number or a null');
        expect(asset.market_share).satisfy(nullOrNumber, 'Expected asset market share to be a number or a null');
        expect(asset.status).oneOf(['assets.status.400', 'assets.status.401', 'assets.status.402'], 'Expected status to be between 400 and 402 with a translation key');

    }

});

Then('a new Asset Status Change entry is saved to the database with the correct type', async function () {

    const {
        AssetStatusChange
    } = require('../../../models');
    const asset_status_change = await AssetStatusChange.findOne({
        where: {
            asset_id: this.current_asset.id
        },
        raw: true,
        order: [ [ 'timestamp', 'DESC' ] ]
    });

    expect(asset_status_change.type).to.equal(this.current_action, 'Expected asset status change type to equal the one that was previously selected');

    this.current_status_change = asset_status_change;

});

Then('the rationale I provided is saved', function () {

    expect(this.current_status_change.comment).to.equal(this.current_rationale, 'Expected status change comment to equal the provided rationale');

});

Then('I am assigned to the Status Change', function () {

    expect(this.current_status_change.user_id).to.equal(World.current_user.id, 'Expected the status change user id to equal to id of the user curretly logged in');

});

Then('I see the status change logs:', async function(data_table_raw) {

    chai.assert.isObject(this.current_asset, `Context missing current asset for this step!`);

    const asset_status_history = await require('../../../services/AssetService').fetchAssetStatusHistory(this.current_asset);
    chai.assert.isNotNull(asset_status_history, `Could not fetch asset status history for asset ${this.current_asset}!`);

    const example_history = data_table_raw.hashes();
    chai.assert.isArray(example_history, 'Poorly formatted data table not array!');
    chai.assert.equal(asset_status_history.length, example_history.length, `history retrieved is different size from example history!`);

    utils.compareViewTables.bind(this)(asset_status_history, example_history, {
        'type': (value) => `assets.status.${value}`
    });

    this.current_asset_status_history = asset_status_history;
});

Then(/the rationale from change at (.*) has text "(.*)"/, async function(change_time_text, change_rationale) {

    chai.assert.isNotNull(this.current_asset_status_history, 'Context needs to have asset status history for this step!');
    const timestamp = new Date(change_time_text);
    chai.assert.notEqual(timestamp.toString(), 'Invalid Date', `The provided timestamp text ${change_time_text} did not resolve to a valid date!`);

    const relevant_change = _.find(this.current_asset_status_history, status => status.timestamp.getTime() == timestamp.getTime());
    chai.assert.isNotNull(relevant_change, `Did not find status change at ${timestamp}`);
    
    chai.assert.equal(relevant_change.comment, change_rationale, `Relevant status change rationale different, expected ${change_rationale}!`);
});

Then('I can see the new status and history by getting the Asset details', function () {

    return chai
        .request(this.app)
        .get(`/v1/assets/detailed/${this.current_asset.id}`)
        .set('Authorization', World.current_user.token)
        .then(result => {

            expect(result).to.have.status(200);
            expect(result.body.asset).to.be.an('object', 'Expected body to contain an asset object');
            expect(result.body.history.length).to.be.greaterThan(0, 'Expected the asset history to have atleast 1 entry');

            const asset = result.body.asset;

            expect(asset.status).to.equal(`assets.status.${this.current_action}`, 'Expected asset status to equal the previously used one');

        });

});

Then(/^I cannot (.*) an Asset which is already (.*)$/, async function (action, type) {

    const type_map = {
        Blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylisted: INSTRUMENT_STATUS_CHANGES.Graylisting,
        Degreylisted: INSTRUMENT_STATUS_CHANGES.Whitelisting
    };

    const action_map = {
        Blacklist: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelist: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylist: INSTRUMENT_STATUS_CHANGES.Graylisting,
        Degreylist: INSTRUMENT_STATUS_CHANGES.Whitelisting
    };

    const { Asset, AssetStatusChange, sequelize } = require('../../../models');

    const [ asset ] = await sequelize.query(queryAssetByType(type_map[type], 1), { model: Asset });

    return chai
        .request(this.app)
        .post(`/v1/assets/${asset.id}/change_status`)
        .set('Authorization', World.current_user.token)
        .send({
            comment: this.current_rationale,
            type: action_map[action]
        })
        .catch(result => {

            expect(result).to.have.status(422);

            const error = result.response.body.error;

            expect(error.startsWith('Cannot set the same status as the current status of the asset'), 
                'Expected the error to talk about setting the same status as the current status of the Asset'
            ).to.be.true;

        });

});

Then('the missing Assets are saved to the database', {
    timeout: 15000
}, async function () {

    const {
        Asset,
        AssetBlockchain
    } = require('../../../models');

    const assets = await AssetBlockchain.findAll({
        include: {
            model: Asset,
            required: true
        },
        raw: true
    });

    const coin_market_cap_assets = this.current_coin_market_cap_response.data;

    /**
     * Let's use greater than minus 1 to act as greater or equal.
     * This is done because the coin market api may not return a coin that was already in the database. Removed? Hidden?
     */
    expect(assets.length).to.be.greaterThan(coin_market_cap_assets.length - 1);

    for (let market_asset of coin_market_cap_assets) {
        const database_asset = assets.find(a => parseInt(a.coinmarketcap_identifier, 10) === market_asset.id);

        expect(database_asset, `Failed to find asset with identifier "${market_asset.id}"`).to.be.not.undefined;

        expect(database_asset['Asset.symbol']).to.equal(market_asset.symbol, 'Expected the asset symbols to match');

        //expect(databaset_asset['Asset.long_name']).to.equal(market_asset.name);
    }

});

Then('BTC and ETH are marked as base and deposit Assets', async function () {

    const {
        Asset
    } = require('../../../models');

    const base_assets = await Asset.findAll({
        where: {
            symbol: ['BTC', 'ETH']
        }
    });

    expect(base_assets.length).to.equal(2);

    for (let asset of base_assets) {
        expect(asset.is_base, `Expected asset ${asset.symbol} to be base`).to.be.true;
        expect(asset.is_deposit, `Expected asset ${asset.symbol} to be deposit`).to.be.true;
    }

});

/**
 * Perhaps later there will be a better way to check this.
 * Considering the asset numbers may not be so predictable (completely new assets appear, not just the ones that were deleted)
 * For now, let's check that that the blockchain asset count has increased
 */
Then('missing Assets were saved to the database', async function () {

    const {
        AssetBlockchain
    } = require('../../../models');

    const asset_count = await AssetBlockchain.count();

    expect(asset_count).to.be.greaterThan(this.current_asset_count, 'Expected to have new assets in the database');

});

Then('Asset market history is saved to the database', async function () {

    const {
        sequelize
    } = require('../../../models');
    const job = require('../../../jobs/market-history-fetcher');

    const joined_tickers = _.reduce(this.current_coin_market_cap_responses, (result, response, url) => {

        if (url.startsWith('/ticker')) {
            _.assign(result.data, response.data);
            if (_.isEmpty(result.metadata)) _.assign(result.metadata, response.metadata);
        }
        return result;

    }, {
        data: {},
        metadata: {}
    });

    const global_data = this.current_coin_market_cap_responses['/global/'];

    const [market_history] = await sequelize.query(`
        SELECT DISTINCT ON(ab.coinmarketcap_identifier) amc.*, ab.coinmarketcap_identifier 
        FROM asset_market_capitalization AS amc
        JOIN asset_blockchain AS ab ON ab.asset_id = amc.asset_id
    `);

    expect(market_history.length).to.equal(_.size(joined_tickers.data));

    for (let coin_id in joined_tickers.data) {

        const ticker = joined_tickers.data[coin_id];
        const matching_history = market_history.find(mh => mh.coinmarketcap_identifier === coin_id);

        const usd_details = _.get(ticker, 'quotes.USD');
        const usd_total = _.get(global_data, 'data.quotes.USD');

        expect(parseInt(matching_history.capitalization_usd)).to.equal(usd_details.market_cap, 'Expected the history capitalization to match');
        expect(_.round(parseFloat(matching_history.market_share_percentage), 6)).to.equal(_.round((usd_details.market_cap / usd_total.total_market_cap) * 100, 6), 'Expected the history market share to match');
        expect(parseFloat(matching_history.daily_volume_usd)).to.equal(usd_details.volume_24h, 'Expected the history daily volume to match');
        expect(new Date(matching_history.timestamp).getTime()).to.equal(joined_tickers.metadata.timestamp * 1000, 'Expected the history timestamp to match the metada timestamp');

    }

});

Then('the system displays an error about not providing a valid rationale', function() {

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error.type).to.equal('validator_errors', 'Expected the error to be a validation error');

});

Then('a new Asset Status Change entry is not created', async function() {

    const { Asset, sequelize } = require('../../../models');
    
    const [ asset ] = await sequelize.query(queryAssetByType(this.current_action, 1, this.current_asset.id), { model: Asset });

    expect(asset, 'Expected not to find an asset with the new status').to.be.undefined;
    
});

Then('the system will save the NVT calculations of the Assets', async function() {

    const { MarketHistoryCalculation, sequelize } = require('../../../models');
    const { NVT_MA_DAYS } = require('../../../jobs/market-history-calc');

    const calculations = await MarketHistoryCalculation.findAll({
        where: { type: MARKET_HISTORY_CALCULATION_TYPES.NVT },
        raw: true 
    });

    expect(calculations.length).to.be.greaterThan(0, 'Expected find Market Calculations');

    for(let calc of calculations) {

        expect(calc.type).to.equal(MARKET_HISTORY_CALCULATION_TYPES.NVT, 'Expected the calculation type to be NVT');
        expect(calc.timestamp).to.be.a('date', 'Expected the calculation timestamp to be a date');
        expect(parseFloat(calc.value)).to.be.a('number', 'Expected the calculation value to be a number');

        /**
         * This is really needed anymore, as there is a separate test which checks the actual
         * calculation. Using the same query to extract the same values does not check much.
         */
        /*const [ expected_nvt ] = await sequelize.query(`
            SELECT avg(nvt) AS nvt, asset_id
            FROM (
                SELECT asset_id, avg(capitalization_usd / daily_volume_usd) AS nvt
                FROM asset_market_capitalization
                WHERE asset_id = ${calc.asset_id} AND "timestamp" > NOW() - INTERVAL '${NVT_MA_DAYS} days'
                GROUP BY asset_id
            ) As daily_nvt
            GROUP BY asset_id
        `, { type: sequelize.QueryTypes.SELECT });*/

        expect(parseFloat(calc.value), `Expected the NVT of ${calc.value} to be a number`).to.be.not.NaN;

    };

});

Then('Assets that don\'t have Market Capitalization data for the last 7 days will be ignored', async function() {

    const { MarketHistoryCalculation, sequelize } = require('../../../models');

    const calculations = await MarketHistoryCalculation.count({
        where: {
            asset_id: this.current_assets.map(asset => asset.id)
        }
    });

    expect(calculations).to.equal(0, 'Expected not to find calculation for Assets that don\'t have market data for the last 7 days');

});

Then(/^the (\w*) weekly NVT will appropriately be equal to (\d+(?:\.\d+)?)$/, async function(asset_symbol, expected_nvt) {

    const { Asset, MarketHistoryCalculation } = require('../../../models');

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    expect(asset, `Expected to find Asset with symbol ${asset_symbol}`).to.be.not.null;

    const newest_calculation = await MarketHistoryCalculation.findOne({
        where: {
            asset_id: asset.id,
            type: MARKET_HISTORY_CALCULATION_TYPES.NVT
        },
        order: [ [ 'timestamp', 'DESC' ] ]
    });

    expected_nvt = Decimal(expected_nvt);

    expect(expected_nvt.toFixed(expected_nvt.dp())).to.equal(Decimal(newest_calculation.value).toFixed(expected_nvt.dp()));

});

Then(/^if (\w*) gets (Blacklisted|Whitelisted|Greylisted)$/, async function(asset_symbol, type) {

    const type_map = {
        Blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylisted: INSTRUMENT_STATUS_CHANGES.Graylisting
    };

    const { Asset, AssetStatusChange } = require('../../../models');

    const asset = await Asset.findOne({
        where: { symbol: asset_symbol }
    });

    expect(asset, `Expected to find Asset with symbol ${asset_symbol}`).to.be.not.null;

    return AssetStatusChange.create({
        asset_id: asset.id,
        type: type_map[type],
        timestamp: Date.now(),
        comment: type
    });

});

Then(/^(Asset|Assets) (.*) will (be|remain) (Blacklisted|Whitelisted|Greylisted)$/, async function(dud_1, asset_symbols, dud_2, status) {

    const { Asset, AssetStatusChange } = require('../../../models');

    const status_map = {
        Blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylisted: INSTRUMENT_STATUS_CHANGES.Graylisting
    };
    const current_status = status_map[status];

    asset_symbols = asset_symbols.split(/,|and|or/).map(a => a.trim());
    
    const assets = await Asset.findAll({
        where: { symbol: asset_symbols },
        limit: asset_symbols.length
    });

    expect(assets.length).to.equal(asset_symbols.length, `Expected to find ${asset_symbols.length} : ${asset_symbols.join(', ')}`);

    for(let asset of assets) {

        let current_asset_status = await AssetStatusChange.findOne({
            where: { asset_id: asset.id },
            order: [ [ 'timestamp', 'DESC' ] ]
        });
        
        switch(current_status) {

            case status_map.Blacklisted:
                expect(current_asset_status, `Expected to find an asset status change for ${asset.symbol}`).to.be.not.null;
                expect(current_asset_status.type).to.equal(current_status, `Expected the asset ${asset.symbol} to be Blacklisted`);
                break;

            case status_map.Greylisted:
                expect(current_asset_status, `Expected to find an asset status change for ${asset.symbol}`).to.be.not.null;
                expect(current_asset_status.type).to.equal(current_status, `Expected the asset ${asset.symbol} to be Greylisted`);
                break;

            case status_map.Whitelisted:
                expect(_.get(current_asset_status, 'type', null)).to.satisfy(nullOrSpecificNumber(current_status), `Expected the asset ${asset.symbol} to be Whitelisted`);
                break;

            default:
                throw new Error(`Unknow status ${status}`);
        }
        
    }

});

const queryAssetByType = (type, limit = 1, id = null) => {
    return `
        WITH newest_statuses AS (
            SELECT DISTINCT ON(asset_id) asset_id, "timestamp", "type" FROm asset_status_change
            ORDER BY asset_id, "timestamp" DESC
        )
        SELECT a.* FROM asset AS a
        LEFT JOIN newest_statuses AS n ON n.asset_id = a.id
        INNER JOIN asset_market_capitalization AS cap ON cap.asset_id = a.id
        WHERE ("type" = ${type} ${type === INSTRUMENT_STATUS_CHANGES.Whitelisting ? `OR "type" IS NULL` : ''}) ${id ? `AND a.id = ${id}` : ''}
        LIMIT ${limit}
    `
};