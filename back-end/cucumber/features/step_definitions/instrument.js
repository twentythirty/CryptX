const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { lessThanOrEqual } = require('../support/assert');

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

Given(/^the system is missing Instrument Mappings for (.*)$/, async function(exchange_name) {

    const { Exchange, InstrumentExchangeMapping } = require('../../../models');

    const exchange = await Exchange.findOne({
        where: { name: exchange_name }
    });

    expect(exchange, `Expected to find Exchange with the name ${exchange_name}`).to.not.be.null;

    this.current_exchange = exchange;

    return InstrumentExchangeMapping.destroy({
        where: { exchange_id: exchange.id }
    });

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

Given('the system has updated the Instrument Market Data', async function(){

    const { InstrumentMarketData, InstrumentExchangeMapping } = require('../../../models');

    const mappings = await InstrumentExchangeMapping.findAll({
        raw: true
    });

    return InstrumentMarketData.bulkCreate(mappings.map(m => {
        const bid_price = _.random(0.00001, 0.1, true);
        return {
            bid_price: bid_price,
            ask_price: bid_price * 0.0001,
            exchange_id: m.exchange_id,
            instrument_id: m.instrument_id,
            timestamp: new Date()
        };
    }));

});

Given(/^the system has Instrument Liquidity History for the last (.*) days$/, async function(days) {

    days = parseInt(days);

    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);

    const last_days = [];

    for(let day = days; day >= 0; day--) {

        const new_day = new Date(today);
        new_day.setDate(today.getDate() - day);
        last_days.push(new_day);

    }

    const { InstrumentLiquidityHistory, InstrumentExchangeMapping } = require('../../../models');

    const mappings = await InstrumentExchangeMapping.findAll({
        raw: true
    });

    const history = _.concat(...last_days.map(day => {
        return mappings.map(m => {
            const volume = _.random(100, 100000, false);
            return {
                volume,
                exchange_id: m.exchange_id,
                instrument_id: m.instrument_id,
                timestamp_to: new Date(day),
                timestamp_from: new Date().setDate(day.getDate() - 1)
            };
        });
    }));

    return InstrumentLiquidityHistory.bulkCreate(history);

});

Given(/^the system is missing base Asset prices in USD for the last (.*) (.*)$/, async function(amount, interval_type) {

    amount = parseInt(amount);
    const start_time = new Date();
   
    switch(true) {

        case /^(minute|minutes)$/g.test(interval_type):
            start_time.setMinutes(start_time.getMinutes() - amount);
            break;

    }

    const { Asset, Instrument, InstrumentMarketData, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const assets = await Asset.findAll({
        where: {
            [Op.or]: [
                { is_base: true }, { symbol: 'USD' }
            ]
        }
    });

    const base_assets = assets.filter(asset => asset.is_base);
    const usd = assets.find(asset => asset.symbol === 'USD');

    const instruments = await Instrument.findAll({
        where: {
            quote_asset_id: usd.id,
            transaction_asset_id: base_assets.map(asset => asset.id)
        }
    });

    return InstrumentMarketData.destroy({
        where: {
            instrument_id: instruments.map(instrument => instrument.id),
            timestamp: { [Op.gte]: start_time }
        }
    });

});

Given('the system is missing Instrument Exchange Mappings from quote asset USD or USDT into base assets', async function() {

    const { Asset, Instrument, InstrumentExchangeMapping } = require('../../../models');

    const assets = await Asset.findAll({
        where: { symbol: ['USD', 'USDT'] }
    });

    const instruments = await Instrument.findAll({
        where: { quote_asset_id: assets.map(asset => asset.id) }
    });

    return InstrumentExchangeMapping.destroy({
        where: { instrument_id: instruments.map(i => i.id) }
    });

});

Given('the system does not have Instrument Liquidity History', function() {

    const { InstrumentLiquidityHistory } = require('../../../models');

    return InstrumentLiquidityHistory.destroy({ where: {} });

});

Given('the system does not have Instrument Market Data', function() {

    const { InstrumentMarketData, ActionLog } = require('../../../models');

    return Promise.all([
        InstrumentMarketData.destroy({ where: {} }),
        ActionLog.destroy({
            where: { translation_key: 'logs.ask_bid_fetcher.instrument_without_data' }
        })
    ]);

});

When('I create a new Instrument with those Assets', function() {

    const new_instrument = {
        transaction_asset_id: this.current_transaction_asset.id,
        quote_asset_id: this.current_quote_asset.id
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
            
        })
        .catch(error => {

            this.current_response = error;

        })

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

When('I find an Instrument that has Mappings', async function(){

    const { Instrument, InstrumentExchangeMapping } = require('../../../models');

    const instrument = await Instrument.findOne({
        where: {},
        include: {
            model: InstrumentExchangeMapping,
            required: true
        }
    });

    expect(instrument, 'Expected to find a mappable instrument, but failed').to.not.null;

    this.current_instrument = instrument;

});

When('I retrieve the Instrument information', function(){
    
    return chai
        .request(this.app)
        .get(`/v1/instruments/${this.current_instrument.id}/`)
        .set('Authorization', World.current_user.token)
        .then(result => {   

            expect(result).to.have.status(200);
            expect(result.body.instrument).to.be.an('object', 'Expected the response body to contain an instrument object');

            this.current_instrument = result.body.instrument;

        });

});

When('I retrieve the Instrument Exchange Mappings related to it', function(){

    return chai
        .request(this.app)
        .get(`/v1/instruments/${this.current_instrument.id}/exchanges`)
        .set('Authorization', World.current_user.token)
        .then(result => {   

            expect(result).to.have.status(200);
            expect(result.body.mapping_data.length).to.be.greaterThan(0, 'Expected to have at least one mapping for the Instrument');

            this.current_instrument_mappings = result.body.mapping_data;

        });
    
});

When(/^I select an Instrument which is (not mapped|mapped) to (.*)$/, async function(is_mapped, exchange_name) {

    is_mapped = (is_mapped === 'mapped');

    let exchange_names = exchange_name.split(/and|\,/g).map(name => name.trim());
    if(exchange_name === 'all Exchanges') exchange_names = ['Binance', 'Bitfinex', 'OKEx']; //Only MVP

    const { Exchange, Instrument, InstrumentExchangeMapping, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const exchanges = await Exchange.findAll({
        where: { name: exchange_names }
    });

    expect(exchanges.length, `Expected to find an exchange with the name/names ${exchange_name}`).to.be.greaterThan(0);

    this.current_exchanges = exchanges;
    if(exchange_names) this.current_exchange = exchanges.find(e => e.name === exchange_names[0]);

    let mapping_where = { exchange_id: exchanges.map(e => e.id) };

    if(!is_mapped) mapping_where = {
        exchange_id: { [Op.notIn]: exchanges.map(e => e.id) }
    };

    const mappings = await InstrumentExchangeMapping.findAll({
        attributes: [
            'instrument_id',
            [ sequelize.fn('count', 'instrument_id'), 'mapped_exchanges' ]
        ],
        group: ['instrument_id'],
        where: mapping_where,
        raw: true
    });

    const matching_mapping = mappings.find(m => parseInt(m.mapped_exchanges) >= exchanges.length);

    expect(matching_mapping, `Expect to find an instrument which is mapped to ${exchange_name}`).to.be.not.undefined;

    const instrument = await Instrument.findById(matching_mapping.instrument_id);

    expect(instrument, `Expected to find an instrument which was mapped to ${exchange_name}`).to.be.not.null;

    this.current_instrument = instrument;

});

Then('the new Instrument is saved to the database', async function() {

    const { Instrument } = require('../../../models');

    const instrument = await Instrument.findOne({
        where: {
            transaction_asset_id: this.current_transaction_asset.id,
            quote_asset_id: this.current_quote_asset.id
        },
        raw: true
    });

    expect(instrument, 'Expect the instrument to be saved and found fro mthe database').to.be.not.null;

    this.current_instrument = instrument;

});

Then('a symbol is created from the selected Assets', function() {

    expect(this.current_instrument.symbol).to.equal(`${this.current_transaction_asset.symbol}/${this.current_quote_asset.symbol}`, 'Expected the instrument to be a combination of symbols of the assets');

});

Then('I cannot create a new Instrument with the same Assets by switching them around', function() {

    const new_instrument = {
        transaction_asset_id: this.current_quote_asset.id,
        quote_asset_id: this.current_transaction_asset.id
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

    expect(mapping, 'Expected a new mapping in the database').to.be.not.null;

    expect(mapping.external_instrument_id).to.equal(this.current_external_instrument, 'Expected external instruments to match');

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

Then('the Instrument information should indidicate the amount of Exchanges connected', async function() {

    const { InstrumentMarketData, sequelize } = require('../../../models');
    const { Op } = sequelize;

    const instrument = this.current_instrument;

    const exchange_count = await InstrumentMarketData.count({
        where: {
            instrument_id: instrument.id,
            timestamp: { [Op.gte]: Date.now() - 15 * 60 * 1000 }
        },
        distinct: true,
        col: 'exchange_id'
    });

    //Given that the Market Data was just created, the failed exchanges count should alwas be 0 in this situation
    expect(parseInt(instrument.exchanges_connected)).to.be.a('number', 'Expected to have a number of exchanges connected');
    expect(parseInt(instrument.exchanges_connected)).to.equal(exchange_count, 'Expected the number of connected exchanges to equal to number of exchanges that have data for the last 15 minutes');
    expect(parseInt(instrument.exchanges_failed)).to.be.a('number', 'Expected the failed exchanges to be a number');
    expect(parseInt(instrument.exchanges_failed)).to.equal(0, 'Expected to have no failed exchanges');

});

Then('the Instrument Exchange Mappings their current price, last day and week volumes', function() {

    const { InstrumentLiquidityHistory, InstrumentMarketData, sequelize } = require('../../../models');
    const { Op } = sequelize;

    return Promise.all(this.current_instrument_mappings.map(async mapping => {
        const where = { instrument_id: this.current_instrument.id, exchange_id: mapping.exchange_id };

        const last_day = new Date();
        last_day.setDate(last_day.getDate() - 1);

        const last_week = new Date();
        last_week.setDate(last_week.getDate() - 7);

        const [ market_data, last_day_history, last_week_volume ] = await Promise.all([
            InstrumentMarketData.findOne({
                where,
                order: [[ 'timestamp', 'DESC' ]],
                raw: true
            }),
            InstrumentLiquidityHistory.findOne({
                where: Object.assign(
                    { timestamp_to: { [Op.gte]: last_day } },
                    where
                ),
                order: [[ 'timestamp_to', 'DESC' ]],
                raw: true
            }),
            InstrumentLiquidityHistory.sum('volume', {
                where: Object.assign(
                    { timestamp_to: { [Op.gte]: last_week } },
                    where
                )
            })
        ]);

        expect(parseFloat(mapping.current_price)).to.be.a('number', 'Expected the instrument mapping price to be a number');
        expect(parseFloat(mapping.current_price)).to.equal(parseFloat(market_data.ask_price), 'Expected the instrument mapping price to equal the newest ask price');

        expect(parseInt(mapping.last_day_vol)).to.be.a('number', 'Expected the instrument mapping last day volume to be a number');
        expect(parseInt(mapping.last_day_vol)).to.equal(parseInt(last_day_history.volume), 'Expected the instrument mapping last day volume to equal the newest volume');

        expect(parseInt(mapping.last_week_vol)).to.be.a('number', 'Expected the instrument mapping last week volume to be a number');
        expect(parseInt(mapping.last_week_vol)).to.equal(last_week_volume, 'Expected the instrument mapping last week volume to equal the sum of volumes for the last week');

    }));

});

Then('the system will display an error about not using two different assets', function() {

    expect(this.current_response).to.has.status(422);

    const error = this.current_response.response.body.error;

    expect(error).to.equal('Instruments can only be created using two different assets');

});

Then('the system creates a new entry for each ticker it fetched with a valid volume', async function() {

    const { InstrumentLiquidityHistory, Instrument, Exchange, sequelize } = require('../../../models');
    const { Op } = sequelize;
    const CCXTUtils = require('../../../utils/CCXTUtils');

    const exchnages = await Exchange.findAll({
        where: {
            name: ['Binance', 'Bitfinex']
        },
        include: Instrument,
        raw: true
    });

    const connectors = await Promise.all(exchnages.map(e => {
        return CCXTUtils.getConnector(e.api_id);
    }));

    const history = await InstrumentLiquidityHistory.findAll({
        where: { 
            exchange_id: exchnages.map(e => e.id)
        },
        raw: true 
    });

    let tickers = await Promise.all(connectors.map(connector => {
        return connector.fetchTickers();
    }));

    tickers = _.flatten(tickers).filter(ticker => ticker.baseVolume);

    for(let h of history) {

        const matching_ticker = tickers.find(tick => tick.symbol === h['Instrument.symbol']);

        expect(matching_ticker, 'Expected to find a matching ticker wich has a baseVolume').to.be.not.null;
        expect(parseFloat(h.volume)).to.be.a('number', 'Expected the history volume to be a number');

    }

    this.current_instrument_liquidity_history = history;

});

Then('the differenece in timestamps should be 24 hours', function() {

    for(let history of this.current_instrument_liquidity_history) {

        const difference = history.timestamp_to.getTime() - history.timestamp_from.getTime();

        expect(difference).to.equal(24 * 60 * 60 * 1000, 'Expected the history entry timestamp difference to be 24 hours');

    }

});

Then('the system creates a new entry for each Instrument that has a valid mapping', async function() {

    const { InstrumentMarketData, InstrumentExchangeMapping } = require('../../../models');

    const [ market_data, instrument_mappings ] = await Promise.all([
        InstrumentMarketData.findAll({ raw: true }),
        InstrumentExchangeMapping.findAll({ raw: true })
    ]);

    expect(market_data.length).to.satisfy(lessThanOrEqual(instrument_mappings.length), 'Expected the market data to equal or to be less then the maount of instrument mappings');

    for(let data of market_data) {

        const matching_mapping = instrument_mappings.find(im => im.instrument_id === data.instrument_id && im.exchange_id === data.exchange_id);

        expect(matching_mapping, 'Expected to find a matching instrument mapping for the instrument market data').to.be.not.null;

        expect(parseFloat(data.ask_price)).to.be.a('number', 'Expected the market data ask price to be a number');
        expect(parseFloat(data.bid_price)).to.be.a('number', 'Expected the market data bid price to be a number');
        expect(data.timestamp).to.be.a('date', 'Expected the timestamp of the market data to be a date');

    }

    this.current_market_data_mapping_difference = instrument_mappings.length - market_data.length;

});

Then('a warning log entry is created for each Instrument which did not have a price on the exchange', async function() {

    const { ActionLog } = require('../../../models');

    const log_count = await ActionLog.count({
        where: { translation_key: 'logs.ask_bid_fetcher.instrument_without_data' }
    });

    expect(log_count).to.equal(this.current_market_data_mapping_difference, 'Expected the log count to equal to the number of instruments without market data');

});