const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const { nullOrNumber } = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('the system has Assets', async function() {

    const { Asset } = require('../../../models');

    const asset_count = await Asset.count();

    expect(asset_count).to.be.greaterThan(0);

});

Given('the system has only WhiteListed Assets', function() {

    const { AssetStatusChange } = require('../../../models');

    return AssetStatusChange.destroy({ where: { } });

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
            console.log(result.body);
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