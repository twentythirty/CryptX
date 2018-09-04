const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

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