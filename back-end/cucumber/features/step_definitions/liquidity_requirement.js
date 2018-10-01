const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const { nullOrNumber, greaterThanOrEqual, lessThanOrEqual } = require('../support/assert');

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('there are no Liquidity Requirements in the system', function() {

    const { InstrumentLiquidityRequirement } = require('../../../models');

    return InstrumentLiquidityRequirement.destroy({ where: { } });

});

Given(/^the system has Liquidity Requirement for (\w+\/\w+) for (.*) and periodicity of (.*) days$/, async function(instrument_symbol, exchange_name, periodicity) {

    const { Exchange, Instrument, InstrumentLiquidityRequirement, InstrumentLiquidityHistory, sequelize } = require('../../../models');

    let exchange_id = null;

    if(exchange_name.toLowerCase() !== 'all exchanges') {

        const exchange = await Exchange.findOne({
            where: { name: exchange_name }
        });

        expect(exchange, `Expected to find exchnage with name ${exchange_name}`).to.be.not.null;

        exchange_id = exchange.id;

    }

    const instrument = await  Instrument.findOne({ where: { symbol: instrument_symbol } });

    expect(instrument, `Expected to find an instrument with the symbol ${instrument_symbol}`).to.be.not.null;
    this.current_instrument = instrument;

    const [ history ] = await InstrumentLiquidityHistory.findAll({
        where: { instrument_id: instrument.id },
        attributes: [
            [ sequelize.fn('avg', sequelize.col('volume')), 'average_volume' ]
        ],
        group: ['instrument_id'],
        raw: true
    });

    const requiremnt = await InstrumentLiquidityRequirement.create({
        exchange: exchange_id,
        instrument_id: instrument.id,
        minimum_volume: history.average_volume,
        periodicity_in_days: periodicity
    });

    this.current_liqudity_requirement = requiremnt;

});

When(/^I add a Liquidity Requirement for (.*)$/, async function(exchange_name) {

    const { Exchange } = require('../../../models');

    let exchange_id = null;

    if(exchange_name !== 'all Exchanges') {
        
        if(!this.current_exchange || this.current_exchange !== exchange_name) {

            const exchange = await Exchange.findOne({
                where: { name: exchange_name }
            });
    
            this.current_exchnage = exchange;
            exchange_id = exchange.id
    
        }
        else exchange_id = this.current_exchange.id;

    }

    const requirement = {
        instrument_id: this.current_instrument.id,
        exchange_id: exchange_id,
        periodicity: _.random(5, 20, false),
        minimum_circulation: _.random(1000, 10000, false)
    };

    this.current_request_body = requirement;

    return chai
        .request(this.app)
        .post(`/v1/liquidity_requirements/create`)
        .set('Authorization', World.current_user.token)
        .send(requirement)
        .then(result => {   

            expect(result).to.have.status(200);
            
            this.current_response = result;

        }).catch(error => {

            this.current_response = error;

        });

});

When(/^I retrieve the Liquidity Requirement details for (.*) instrument$/, async function(instrument_symbol) {

    const { InstrumentLiquidityRequirement, Instrument } = require('../../../models');

    let requirement = this.current_liqudity_requirement;

    const instrument = await Instrument.findOne({
        where: { symbol: instrument_symbol }
    });

    if(!requirement || requirement.instrument_id !== instrument.id) {

        expect(instrument, `Expected to find instrument with symbol ${instrument_symbol}`).to.be.not.null;
        this.current_instrument = instrument;

        requirement = await InstrumentLiquidityRequirement.findOne({
            where: { instrument_id: instrument.id }
        });

        expect(requirement, `Expected to find a Liquidity Requiremnt for instrument ${instrument_symbol}`).to.be.not.null;
        this.current_liqudity_requirement = requirement;

    }

    this.current_request_time = new Date();
    const [ requirement_details, requirement_exchanges ] = await Promise.all([
        chai
            .request(this.app)
            .get(`/v1/liquidity_requirements/${requirement.id}`)
            .set('Authorization', World.current_user.token),
        chai
            .request(this.app)
            .get(`/v1/liquidity_requirements/${requirement.id}/exchanges`)
            .set('Authorization', World.current_user.token)
    ]);

    expect(requirement_details).to.have.status(200);
    expect(requirement_exchanges).to.have.status(200);

    expect(requirement_details.body.liquidity_requirement).to.be.an('object', 'Expected to find a Liquidity Requirement object in the response');
    expect(requirement_exchanges.body.exchanges).to.be.an('array', 'Expected to find an array of Exchange objects in the response');

    this.current_responses = [ requirement_details, requirement_exchanges ];

    this.current_liqudity_requirement_details = requirement_details.body.liquidity_requirement;
    this.current_liqudity_requirement_exchanges = requirement_exchanges.body.exchanges

});

Then('the new Liquidity Requirement is saved to the database', async function() {

    const { InstrumentLiquidityRequirement } = require('../../../models');

    const requirement = await InstrumentLiquidityRequirement.findOne({
        where: {
            exchange: this.current_request_body.exchange_id,
            instrument_id: this.current_request_body.instrument_id
        }
    });

    expect(requirement, 'Expected to find the newely created liquidity Requirement').to.not.be.null;

    expect(requirement.exchange).to.equal(this.current_request_body.exchange_id, 'Expected the Exchange Ids to match');
    expect(requirement.instrument_id).to.equal(this.current_request_body.instrument_id, 'Expected the Instrument Ids to match');
    expect(parseFloat(requirement.minimum_volume)).to.equal(this.current_request_body.minimum_circulation, 'Expected minimum volumes to match');
    expect(requirement.periodicity_in_days).to.equal(this.current_request_body.periodicity, 'Expected the periodicity to match');

    this.current_liqudity_requirement = requirement;

});

Then('I cannot add another Requirement for the same Instrument and Exchange', function() {

    let requirement = this.current_request_body;

    if(!requirement) requirement = {
        instrument_id: this.current_instrument.id,
        exchange_id: this.current_exchange.id,
        periodicity: _.random(5, 20, false),
        minimum_circulation: _.random(1000, 10000, false)
    };

    return chai
        .request(this.app)
        .post(`/v1/liquidity_requirements/create`)
        .set('Authorization', World.current_user.token)
        .send(requirement)
        .catch(result => {
            
            expect(result).to.have.status(422);

            const error = result.response.body.error;

            expect(error).to.equal(`A requirement for instrument with id ${requirement.instrument_id} and exchange with id ${requirement.exchange_id} already exists`);

        });
});

Then('I can add another Requirement to the same Instrument by choosing a different Exchange', async function() {

    const { InstrumentExchangeMapping, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const mapping = await InstrumentExchangeMapping.findOne({
        where: {
            instrument_id: this.current_instrument.id,
            exchange_id: { [Op.ne]: this.current_exchange.id }
        }
    });

    expect(mapping, `Expected to find a mapping for Instrument ${this.current_instrument.symbol} for other than ${this.current_exchange.name}`).to.be.not.null;

    const requirement = {
        instrument_id: this.current_instrument.id,
        exchange_id: mapping.exchange_id,
        periodicity: _.random(5, 20, false),
        minimum_circulation: _.random(1000, 10000, false)
    };

    return chai
        .request(this.app)
        .post(`/v1/liquidity_requirements/create`)
        .set('Authorization', World.current_user.token)
        .send(requirement)
        .then(result => {
            
            expect(result).to.have.status(200);
            expect(result.body.liquidity_requirement).to.be.an('object', 'Expected to find a Liquidity Requirement object in the body');

        });

});

Then(/^the system will display an error about my selected instrument not having mappings for (.*)$/, async function(exchange_name) {

    const { Exchange } = require('../../../models');

    let exchange = this.current_exchange;

    if(!exchange || exchange.name !== exchange_name) {

        exchange = await Exchange.findOne({
            where: { name: exchange_name }
        });

        expect(exchange, `Expected to find Exchange with name ${exchange_name}`).to.be.not.null;

        this.current_exchange = exchange;

    }

    expect(this.current_response).to.have.status(422);

    const error = this.current_response.response.body.error;

    expect(error).to.equal(`Exchange with id "${exchange.id}" is not mapped to instrument with id "${this.current_instrument.id}"`);

});

Then('no specific Exchange is assigned to the Liquidity Requirement', function() {

    expect(this.current_liqudity_requirement.exchange, 'Expected the field "exchange" to be null').to.be.null;

});

Then('I cannot add any more Liquidity Requirements for this Instrument', async function() {

    const { Exchange } = require('../../../models');

    const exchanges = await Exchange.findAll();

    const exchange_ids = [null, ...exchanges.map(e => e.id)];

    for(let exchange_id of exchange_ids) {

        const requirement = {
            instrument_id: this.current_instrument.id,
            exchange_id: exchange_id,
            minimum_circulation: _.random(1000, 10000, false),
            periodicity: _.random(2, 5, false)
        };

        await chai
            .request(this.app)
            .post(`/v1/liquidity_requirements/create`)
            .set('Authorization', World.current_user.token)
            .send(requirement)
            .catch(result => {
                
                expect(result).to.have.status(422);
                
                const error = result.response.body.error;

                expect(error).to.equal(`A requirement for instrument with id ${this.current_instrument.id} already exists for all exchanges`);

            });

    }

});

Then('I will see the details of the Liquidity Requirement', async function() {

    const { Asset } = require('../../../models');

    const requirement_details = this.current_liqudity_requirement_details;
    const requirement = this.current_liqudity_requirement;

    expect(requirement_details.id).to.be.a('number', 'Expected the id to be present and be a number');
    expect(requirement_details.periodicity).to.equal(requirement.periodicity_in_days, 'Expected the periodicity to match the one in the database');

    const quote_asset = await Asset.findById(this.current_instrument.quote_asset_id);

    expect(requirement_details.quote_asset).to.equal(quote_asset.symbol, 'Expected the quote asset symbol to match with instrument one');
    expect(requirement_details.minimum_circulation).to.equal(requirement.minimum_volume, 'Expected the minimum circulation to match the volum in the database');

    expect(parseInt(requirement_details.exchange_count)).to.be.a('number', 'Expected the exchange count to a propper number');
    expect(parseInt(requirement_details.exchange_pass)).to.be.a('number', 'Expected the exchange pass to a propper number');

});

Then(/^the number of Exchanges for the Liquidity Requirement will be (.*)$/, function(exchange_count) {

    exchange_count = parseInt(exchange_count);

    const requirement_details = this.current_liqudity_requirement_details;
    const requirement_exchanges = this.current_liqudity_requirement_exchanges;

    expect(parseInt(requirement_details.exchange_count)).to.equal(exchange_count, `Expected the exchange count to be ${exchange_count}`);
    expect(requirement_exchanges.length).to.equal(exchange_count, `Expected the number of exchanges in the list to be ${exchange_count}`);

});

Then(/^the number of Exchanges will be the number of Exchanges that have mappings for (.*)$/, async function(instrument_symbol) {

    const { Instrument, InstrumentExchangeMapping } = require('../../../models');

    const requirement_details = this.current_liqudity_requirement_details;
    const requirement_exchanges = this.current_liqudity_requirement_exchanges;

    const instrument = await Instrument.findOne({
        where: { symbol: instrument_symbol }
    });

    expect(instrument, `Expected to find instrument with symbol ${instrument_symbol}`).to.be.not.null;

    const mapping_count = await InstrumentExchangeMapping.count({
        where: { instrument_id: instrument.id }
    });

    expect(parseInt(requirement_details.exchange_count)).to.equal(mapping_count, `Expected the exchange count to be ${mapping_count}`);
    expect(requirement_exchanges.length).to.equal(mapping_count, `Expected the number of exchanges in the list to be ${mapping_count}`);

});

Then('the Exchange list will contain the Instrument current price, last day volume and average volume for the past week', async function() {

    const { InstrumentLiquidityHistory, InstrumentMarketData, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const requirement_exchanges = this.current_liqudity_requirement_exchanges;

    for(let exchange of requirement_exchanges) {

        const [ market_data, last_day_liqudity, [ last_week_liquidity ] ] = await Promise.all([
            InstrumentMarketData.findOne({
                where: {
                    instrument_id: this.current_instrument.id,
                    exchange_id: exchange.exchange_id
                },
                order: [ [ 'timestamp', 'DESC' ] ]
            }),
            InstrumentLiquidityHistory.findOne({
                where: {
                    instrument_id: this.current_instrument.id,
                    exchange_id: exchange.exchange_id
                },
                order: [ [ 'timestamp_to', 'DESC' ] ]
            }),
            InstrumentLiquidityHistory.findAll({
                where: {
                    instrument_id: this.current_instrument.id,
                    exchange_id: exchange.exchange_id,
                    timestamp_to: {
                        [Op.gte]: this.current_request_time.getTime() - 7 * 24 * 60 * 60 * 1000
                    }
                },
                attributes: [
                    [ sequelize.fn('avg', sequelize.col('volume')), 'volume' ]
                ],
                group: [ 'instrument_id', 'exchange_id' ]
            })
        ]);

        expect(exchange.current_price).to.equal(market_data.ask_price, 'Expected the current price to equal the newest ask price');
        expect(exchange.last_day_vol).to.equal(last_day_liqudity.volume, 'Expected the last day volume to equal the newest one');
        expect(exchange.last_week_vol).to.equal(last_week_liquidity.volume, 'Expected the last week volume to be the average volume for the past week');
        
    }
    
});

Then('Exchanges that pass the requirement are marked accordinally', function() {

    const requirement_details = this.current_liqudity_requirement_details;
    const requirement_exchanges = this.current_liqudity_requirement_exchanges;

    for(let exchange of requirement_exchanges) {

        if(Decimal(exchange.last_week_vol).gte(requirement_details.minimum_circulation)){
            expect(exchange.passes).to.equal('liquidity_exchanges.status.meets_liquidity_requirements');
        }
        else {
            expect(exchange.passes).to.equal('liquidity_exchanges.status.lacking');
        }

    }

    const non_lacking_exchanges = requirement_exchanges.filter(e => e.passes === 'liquidity_exchanges.status.meets_liquidity_requirements');
    const lacking_exchanges = requirement_exchanges.filter(e => e.passes === 'liquidity_exchanges.status.lacking');

    expect(parseInt(requirement_details.exchange_pass)).to.equal(non_lacking_exchanges.length, 'Expected the pass count to equal the actual number of passed exchanges');
    expect(parseInt(requirement_details.exchange_not_pass)).to.equal(lacking_exchanges.length, 'Expected the not pass count to equal the actual number of lacking exchanges');

});