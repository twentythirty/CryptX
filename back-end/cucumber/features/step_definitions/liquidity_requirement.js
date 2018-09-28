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