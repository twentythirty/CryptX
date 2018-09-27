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
    nullOrNumber
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
 
    assets = await Asset.findAll({
        where: {
            is_base: false, is_deposit: false
        },
        raw: true,
        limit: amount
    });

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

Given(/^the system has Asset Market Capitalization for the last (.*) hours$/, {
    timeout: 15000
}, async function (hours) {

    hours = parseInt(hours);

    const now = new Date();

    const {
        Asset,
        AssetMarketCapitalization,
        sequelize
    } = require('../../../models');
    const {
        Op
    } = sequelize;

    const last_hours = [];

    for (let hour = 0; hour <= hours; hour += 2) {

        const new_hour = new Date(now);
        new_hour.setHours(now.getHours() - hour);
        last_hours.unshift(new_hour);

    }

    const assets = await Asset.findAll({
        where: {},
        raw: true
    });

    const current_capitalization = await AssetMarketCapitalization.count({
        where: {
            timestamp: {
                [Op.gte]: new Date().setHours(now.getHours() - hours)
            }
        },
        distinct: true,
        col: 'asset_id'
    });

    if (assets.length === current_capitalization) return;

    let market_cap = _.concat(...last_hours.map(hour => {
        let total_cap = 0;

        let base_capitalization = assets.map(asset => {
            const capitalization = _.random(10000, 100000000, false);
            total_cap += capitalization;

            return {
                timestamp: hour,
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
                    [Op.lte]: new Date().setHours(now.getHours() - hours)
                }
            },
            transaction
        }).then(() => {
            return AssetMarketCapitalization.bulkCreate(market_cap);
        });
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

When(/^I select a (.*) Asset$/, async function(type) {

    const type_map = {
        Blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylisted: INSTRUMENT_STATUS_CHANGES.Graylisting
    };

    const { Asset, AssetStatusChange, sequelize } = require('../../../models');

    const [ asset ] = await sequelize.query(queryAssetByType(type_map[type], 1), { model: Asset })

    expect(asset, 'Expected to find a Greylisted asset').to.be.not.null;

    this.current_asset = asset;

});

When(/^I (.*) (the|an|any) Asset$/, async function (action, pointer) {

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
            asset = await Asset.findOne({
                where: {
                    is_base: false,
                    is_deposit: false
                },
                raw: true
            });
            break;

    }

    this.current_asset = asset;

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

const queryAssetByType = (type, limit = 1, id = null) => {
    return `
        WITH newest_statuses AS (
            SELECT DISTINCT ON(asset_id) asset_id, "timestamp", "type" FROm asset_status_change
            ORDER BY asset_id, "timestamp" DESC
        )
        SELECT * FROM asset AS a
        LEFT JOIN newest_statuses AS n ON n.asset_id = a.id
        WHERE ("type" = ${type} ${type === INSTRUMENT_STATUS_CHANGES.Whitelisting ? `OR "type" IS NULL` : ''}) ${id ? `AND id = ${id}` : ''}
        LIMIT ${limit}
    `
};