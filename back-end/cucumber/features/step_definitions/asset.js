const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');

const { nullOrNumber } = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const request_promise = require('request-promise');

const World = require('../support/global_world');

const coin_market_cap_url = 'https://api.coinmarketcap.com/v2';

Given('the system has Assets', async function() {

    const { Asset } = require('../../../models');

    const asset_count = await Asset.count();

    expect(asset_count).to.be.greaterThan(0);

});

Given('the system has only WhiteListed Assets', function() {

    const { AssetStatusChange } = require('../../../models');

    return AssetStatusChange.destroy({ where: { } });

});

Given(/^the system has Asset Market Capitalization for the last (.*) hours$/, async function(hours) {

    hours = parseInt(hours);

    const now = new Date();

    const { Asset, AssetMarketCapitalization, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const last_hours = [];

    for(let hour = 0; hour <= hours; hour += 2) {

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
            timestamp: { [Op.gte]: new Date().setHours(now.getHours() - hours) }
        },
        distinct: true,
        col: 'asset_id'
    });

    if(assets.length === current_capitalization) return;

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
            cap.daily_volume_usd = ((cap.capitalization_usd * (cap.market_share_percentage)) / _.random(10, 100)).toFixed(2);

        });

        return base_capitalization;
    }));

    return sequelize.transaction(transaction => {
        return AssetMarketCapitalization.destroy({
            where: {
                timestamp: { [Op.lte]: new Date().setHours(now.getHours() - hours) }
            },
            transaction
        }).then(() => {
            return AssetMarketCapitalization.bulkCreate(market_cap);
        });
    });

});

Given('the system has some missing Assets rom CoinMarketCap, including ETH and BTC', async function() {

    const { Asset, AssetBlockchain, sequelize } = require('../../../models');
    const { Op } = sequelize;

    await Asset.destroy({ where: { symbol: ['ETH, BTC'] } });

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

When('I provide a rationale', function() {

    const rationales = [
        'Random rational 1',
        'Random rational 2',
        'Random rational 3',
        'Random rational 4'
    ];

    this.current_rationale = rationales[_.random(0, rationales.length - 1, false)];

});

When(/^I (.*) an Asset$/, async function(action) {

    const action_map = {
        Blacklist: INSTRUMENT_STATUS_CHANGES.Blacklisting,
        Whitelist: INSTRUMENT_STATUS_CHANGES.Whitelisting,
        Greylist: INSTRUMENT_STATUS_CHANGES.Greylist
    };

    const status = action_map[action];

    const { Asset } = require('../../../models');

    let asset = await Asset.findOne({
        where: { is_base: false, is_deposit: false },
        raw: true
    });

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
            expect(result.body.status).to.be.an('object');

            this.current_action = status;
            this.current_asset = asset;
            
        });

});

When('I select two different Assets', async function() {

    const { Asset } = require('../../../models');

    const assets = await Asset.findAll({
        raw: true
    });

    const divide = Math.round(assets.length/2);

    this.current_assets = [];
    this.current_assets.push(assets[_.random(0, divide)]);
    this.current_assets.push(assets[_.random(divide + 1, assets.length - 1)]);

});

When('the SYNC_COINS job complete it\`s run', {
    timeout: 50000
}, function() {

    const job = require('../../../jobs/coins-list-sync');
    const models = require('../../../models');
    const config = { models };

    return chai
        .request(coin_market_cap_url)
        .get(`/listings`)
        .set('Authorization', World.current_user.token)
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

            await job.JOB_BODY(config, console.log);

            request_promise.get.restore();
            
        });


});

Then('the list should have all of the Assets revelant information if it is available', function() {

    const assets = this.current_assets;

    for(let asset of assets) {

        expect(asset.id).to.be.a('number');
        expect(asset.symbol).to.be.a('string');
        expect(asset.long_name).to.be.a('string');
        expect(asset.is_base).oneOf(['assets.is_base.yes', 'assets.is_base.no']);
        expect(asset.is_deposit).oneOf(['assets.is_deposit.no', 'assets.is_deposit.yes']);
        expect(asset.is_cryptocurrency).oneOf(['assets.is_cryptocurrency.no', 'assets.is_cryptocurrency.yes']);
        expect(asset.capitalization).satisfy(nullOrNumber);
        expect(asset.nvt_ratio).satisfy(nullOrNumber);
        expect(asset.market_share).satisfy(nullOrNumber);
        expect(asset.status).oneOf(['assets.status.400', 'assets.status.401', 'assets.status.402']);

    }

});

Then('a new Asset Status Change entry is save to the database with the correct type', async function() {

    const { AssetStatusChange } = require('../../../models');
    const asset_status_change = await AssetStatusChange.findOne({
        where: { asset_id: this.current_asset.id },
        raw: true
    });

    expect(asset_status_change.type).to.equal(this.current_action);

    this.current_status_change = asset_status_change;

});

Then('the rationale I provided is saved', function() {

    expect(this.current_status_change.comment).to.equal(this.current_rationale);

});

Then('I am assigned to the Status Change', function() {

    expect(this.current_status_change.user_id).to.equal(World.current_user.id);

});

Then('I can see the new status and history by getting the Asset details', function() {

    return chai
        .request(this.app)
        .get(`/v1/assets/detailed/${this.current_status_change.asset_id}`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
 
            expect(result).to.have.status(200);
            expect(result.body.asset).to.be.an('object');
            expect(result.body.history.length).to.be.greaterThan(0);

            const asset = result.body.asset;
            //Get newest status change, who knows how other tests will affect this
            const status_change = result.body.history.sort((a, b) => new Date(a.timestamp).getTime() <= new Date(b.timestamp).getTime())[0];

            expect(asset.status).to.equal(`assets.status.${this.current_action}`);
            expect(status_change.type).to.equal(`assets.status.${this.current_action}`);
            
        });

});

Then('I cannot Blacklist an Asset which is already Blacklisted', function() {

    return chai
        .request(this.app)
        .post(`/v1/assets/${this.current_status_change.asset_id}/change_status`)
        .set('Authorization', World.current_user.token)
        .send({
            comment: this.current_rationale,
            type: this.current_action
        })
        .catch(result => {   

            expect(result).to.have.status(422);
            
        });

});

Then('the missing Assets are saved to the database', async function() {

    const { Asset, AssetBlockchain } = require('../../../models');

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

    for(let market_asset of coin_market_cap_assets) {
        const databaset_asset = assets.find(a => parseInt(a.coinmarketcap_identifier, 10)  === market_asset.id);

        expect(databaset_asset).to.be.not.undefined;

        expect(databaset_asset['Asset.symbol']).to.equal(market_asset.symbol);
        
        //expect(databaset_asset['Asset.long_name']).to.equal(market_asset.name);
    }

});

Then('BTC and ETH are marked as base and deposit Assets', async function() {

    const { Asset } = require('../../../models');

    const base_assets = await Asset.findAll({
        where: { symbol: ['BTC', 'ETH'] }
    });

    expect(base_assets.length).to.equal(2);
    
    for(let asset of base_assets) {
        expect(asset.is_base).to.be.true;
        expect(asset.is_deposit).to.be.true;
    }

});