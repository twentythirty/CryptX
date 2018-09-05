const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there are no Instruments in the system', function() {

    const { Instrument } = require('../../../models');

    return Instrument.destroy({ where: {} });

});

Given(/^the system has Instrument Mappings for (.*)$/, async function (exchange_name) {

    const { Exchange, Asset, Instrument, InstrumentExchangeMapping, sequelize } = require('../../../models');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    let [exchange, assets, instruments] = await Promise.all([
        Exchange.findOne({
            where: { name: exchange_name },
            raw: true
        }),
        Asset.findAll({ raw: true }),
        Instrument.findAll({ raw: true })
    ]);

    const instrument_mappings = await InstrumentExchangeMapping.findAll({
        where: { exchange_id: exchange.id },
        raw: true
    });

    const connector = await ccxtUtil.getConnector(exchange.api_id);

    const exchange_instruments = _.uniq(Object.keys(connector.markets));

    const missing_instruments = _.difference(exchange_instruments, instruments.map(i => i.symbol)).map(mi => {
        const [transaction_asset_symbol, quote_asset_symbol] = mi.split('/');
        const transaction_asset = assets.find(asset => asset.symbol === transaction_asset_symbol);
        const quote_asset = assets.find(asset => asset.symbol === quote_asset_symbol);
        
        if(transaction_asset && quote_asset) {
            return { 
                symbol: mi,
                transaction_asset_id: transaction_asset.id,
                quote_asset_id: quote_asset.id
            }
        }
    }).filter(mi => mi);

    const new_instruments = await Instrument.bulkCreate(missing_instruments, { returning: true });

    if(new_instruments.length) instruments = instruments.concat(new_instruments);

    const missing_mappings = exchange_instruments.map(symbol => {
        const instrument_mapping = instrument_mappings.find(im => im.external_instrument_id === symbol && im.exchange_id === exchange.id);
        const instrument = instruments.find(i => i.symbol === symbol);
        if(!instrument_mapping && instrument) {
            return {
                exchange_id: exchange.id,
                external_instrument_id: symbol,
                instrument_id: instrument.id,
                tick_size: _.get(connector.markets, `${symbol}.limits.amount.min`, 0)
            }
        }
    }).filter(im => im);

    return InstrumentExchangeMapping.bulkCreate(missing_mappings);
    
});

Given(/^there is an Instrument that can be Mapped to (.*)$/, async function(exchange_name) {
    
    const { Exchange, Asset, Instrument, InstrumentExchangeMapping, sequelize } = require('../../../models');
    const ccxtUtil = require('../../../utils/CCXTUtils');

    let [exchange, assets, instruments] = await Promise.all([
        Exchange.findOne({
            where: { name: exchange_name },
            raw: true
        }),
        Asset.findAll({ raw: true }),
        Instrument.findAll({ raw: true })
    ]);

    const connector = await ccxtUtil.getConnector(exchange.api_id);

    const exchange_instruments = _.uniq(Object.keys(connector.markets));

    let attempts = 0;
    while(attempts < 10) {
        const selected_instrument = exchange_instruments[_.random(0, exchange_instruments.length - 1)];
    
        const matching_instument = instruments.find(i => i.symbol === selected_instrument);

        if(matching_instument) {
            this.current_instrument = matching_instument;
            break;
        }
        
        const [ transaction_asset, quote_asset ] = assets.filter(a => selected_instrument.split('/').includes(a.symbol));

        if(transaction_asset && quote_asset) {

            const new_instrument = await Instrument.create({
                transaction_asset_id: transaction_asset.id,
                quote_asset_id: quote_asset.id,
                symbol: selected_instrument
            });

            this.current_instrument = new_instrument.toJSON();
            break;

        }

        attempts++;
    }

    if(attempts >= 10) TE(`Failed to make an instrument that can be mapped to ${exchange_name}`);

});

When('I create a new Instrument with those Assets', function() {

    const new_instrument = {
        transaction_asset_id: this.current_assets[0].id,
        quote_asset_id: this.current_assets[1].id
    };
    
    return chai
        .request(this.app)
        .post(`/v1/instruments/create`)
        .set('Authorization', World.current_user.token)
        .send(new_instrument)
        .then(result => {   
   
            expect(result).to.have.status(200);
            expect(result.body.instrument).to.be.an('object');

            this.current_instrument = result.body.instrument;
            
        });

});

When('I have selected an Instrument to map', function() {

    expect(this.current_instrument).to.be.not.undefined;

});

When(/^I find a matching external identifier for the selected Instrument from (.*)$/, async function(exchange_name) {

    const { Exchange } = require('../../../models');

    const exchange = await Exchange.findOne({
        where: { name: exchange_name },
        raw: true
    });

    return chai
        .request(this.app)
        .get(`/v1/exchanges/${exchange.id}/instruments`)
        .set('Authorization', World.current_user.token)
        .then(result => {   

            expect(result).to.have.status(200);
            expect(result.body.identifiers.length).to.be.greaterThan(0);

            const found_instrument = result.body.identifiers.find(i => i === this.current_instrument.symbol);

            expect(found_instrument).to.be.not.undefined;

            this.current_external_instrument = found_instrument;
            this.current_exchange = exchange;
            
        });

});

When('I create a new Exchange Mapping with my selections', function() {

    const new_instrument_mapping = {
        exchange_mapping: [
            {
                exchange_id: this.current_exchange.id,
                external_instrument_id: this.current_external_instrument
            }
        ]
    };

    return chai
        .request(this.app)
        .post(`/v1/instruments/${this.current_instrument.id}/add_mapping`)
        .set('Authorization', World.current_user.token)
        .send(new_instrument_mapping)
        .then(result => {   
   
            expect(result).to.have.status(200);
            expect(result.body.message).to.equal('OK!');

        });

});

Then('the new Instrument is saved to the database', async function() {

    const { Instrument } = require('../../../models');

    const instrument = await Instrument.findOne({
        where: {
            transaction_asset_id: this.current_assets[0].id,
            quote_asset_id: this.current_assets[1].id
        },
        raw: true
    });

    expect(instrument).to.be.not.null;

    this.current_instrument = instrument;

});

Then('a symbol is created from the selected Assets', function() {

    const [ transaction_asset, quote_asset ] = this.current_assets;

    expect(this.current_instrument.symbol).to.equal(`${transaction_asset.symbol}/${quote_asset.symbol}`);

});

Then('I cannot create a new Instrument with the same Assets by switching them around', function() {

    const new_instrument = {
        transaction_asset_id: this.current_assets[1].id,
        quote_asset_id: this.current_assets[0].id
    };
    
    return chai
        .request(this.app)
        .post(`/v1/instruments/create`)
        .set('Authorization', World.current_user.token)
        .send(new_instrument)
        .catch(result => {   
   
            expect(result).to.have.status(422);

        });

});

Then('the new Mapping is saved to the database', async function() {

    const { InstrumentExchangeMapping } = require('../../../models');

    const mapping = await InstrumentExchangeMapping.findOne({
        where: { instrument_id: this.current_instrument.id }
    });

    expect(mapping).to.be.not.null;

    expect(mapping.external_instrument_id).to.equal(this.current_external_instrument);

});

Then('I can only have one Instrument Mapping for each Exchange per Instrument', function() {

    const new_instrument_mapping = {
        exchange_mapping: [
            {
                exchange_id: this.current_exchange.id,
                external_instrument_id: this.current_external_instrument
            },
            {
                exchange_id: this.current_exchange.id,
                external_instrument_id: this.current_external_instrument
            }
        ]
    };

    return chai
        .request(this.app)
        .post(`/v1/instruments/${this.current_instrument.id}/add_mapping`)
        .set('Authorization', World.current_user.token)
        .send(new_instrument_mapping)
        .catch(result => {   
   
            expect(result).to.have.status(422);

        });

});