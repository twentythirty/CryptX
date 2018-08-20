'use strict';

const Instrument = require('../models').Instrument;
const InstrumentExchangeMapping = require('../models').InstrumentExchangeMapping;
const Asset = require('../models').Asset;
const InstrumentLiquidityRequirement = require('../models').InstrumentLiquidityRequirement;
const Exchange = require('../models').Exchange;
const sequelie = require('../models').sequelize;

const ccxtUtil = require('../utils/CCXTUtils');

const createInstrument = async (transaction_asset_id, quote_asset_id) => {

    if (transaction_asset_id == null || quote_asset_id == null) {
        TE(`Provided null transaction or quote asset ids!`);
    }

    const instrument_assets = await Asset.findAll({
        where: {
            id: [transaction_asset_id, quote_asset_id]
        }
    });
    //check that both assets exist
    if (instrument_assets.length < 2) {
        TE(`Suppleid asset ids ${transaction_asset_id} and ${quote_asset_id} dont all correspond to actual assets!`);
    }
    const assets_by_id = _.keyBy(instrument_assets, 'id');
    //check that an instrument with the same assets doesnt already exist
    const old_instrument = await Instrument.findOne({
        where: {
            transaction_asset_id: transaction_asset_id,
            quote_asset_id: quote_asset_id
        }
    });
    if (old_instrument != null) {
        TE(`Instrument ${old_instrument.symbol} already exists!!`);
    }

    const instrument_symbol = `${assets_by_id[transaction_asset_id].symbol}/${assets_by_id[quote_asset_id].symbol}`;

    const [err, instrument] = await to(Instrument.create({
        transaction_asset_id: transaction_asset_id,
        quote_asset_id: quote_asset_id,
        symbol: instrument_symbol
    }));

    if (err != null) {
        TE(`error occurred creating instrument ${instrument_symbol}!: ${err}`)
    }

    return instrument;
};
module.exports.createInstrument = createInstrument;


const addInstrumentExchangeMappings = async (instrument_id, exchange_mappings) => {

    if (instrument_id == null || !_.isArray(exchange_mappings)) {
        TE(`Supplied bad instrument id or exchange mappings!`)
    }

    //Check for duplicate exchanges
    const duplicates = exchange_mappings.map(mapping => {
        const found = exchange_mappings.filter(map => map.exchange_id === mapping.exchange_id).length;
        //2 is used because it would always find it self.
        if(found >= 2) return true;
    }).filter(mapping => mapping);

    if(duplicates.length) TE(`Only 1 unique exchange mapping is allowed per instrument`);

    //rebuild list of exchange id/external mapping pairs into more convenient lookup
    const exchange_to_external = _.fromPairs(_.map(
        exchange_mappings,
        mapping => [mapping.exchange_id, mapping.external_instrument_id]));

    //fetch laoded-market connectors from ccxt cache for all exchanges in mappings supplied
    //bind an obejct in form <exchange_id>: <connector> key-value pairs 
    //for future access
    const id_connector_map = _.fromPairs(await Promise.all(_.map(exchange_mappings, mapping => {

        return Promise.all([
            Promise.resolve(mapping.exchange_id),
            ccxtUtil.getConnector(mapping.exchange_id)
        ])
    })));

    const tick_sizes = _.fromPairs(_.map(id_connector_map, (connector, exchange_id) => {

        const external_id = exchange_to_external[exchange_id];

        if (external_id == null) {
            TE(`Exchange ${exchange_id} has no associated external instrument!`);
        }

        const instrument_market = connector.markets[external_id];
        if (instrument_market == null) {
            TE(`Instrument ${instrument_id} does not have market on exchange ${exchange_id} for external ${external_id}`);
        }

        return [
            exchange_id,
            instrument_market.limits.amount.min //might be undefined if ccxt has no description for pair?
        ]
    }));

    
    const models = _.map(exchange_mappings, mapping => {
        return {
            instrument_id: instrument_id,
            exchange_id: mapping.exchange_id,
            tick_size: tick_sizes[mapping.exchange_id] == null? 0 : tick_sizes[mapping.exchange_id],
            external_instrument_id: mapping.external_instrument_id 
        };
    })

    const [ err, saved_models ] = await to(
        sequelie.transaction(transaction => {
            return InstrumentExchangeMapping.destroy({
                where: { instrument_id },
                transaction
            }).then(() => {
                return InstrumentExchangeMapping.bulkCreate(models, { transaction });
            });
        })
    );

    if (err) TE(err.message);

    return saved_models;
};
module.exports.addInstrumentExchangeMappings = addInstrumentExchangeMappings;


const getInstrumentIdentifiersFromCCXT = async function () {
  
    let err, exchanges;
    [err, exchanges] = await to(Exchange.findAll());
    if (err) TE(err);

    let connectors = await Promise.all(_.map(exchanges, (exchange) => {
        return ccxtUtil.getConnector(exchange.api_id)
    }));

    let external_ids = _.uniq(
        _.flatten( 
            _.map(connectors, connector => Object.keys(connector.markets))
        )
    );
    
    return external_ids;
};
module.exports.getInstrumentIdentifiersFromCCXT = getInstrumentIdentifiersFromCCXT;

const deleteExchangeMapping = async (instrument_id, exchange_id) => {

    if(!_.isNumber(instrument_id) || !_.isNumber(exchange_id)) TE(`Valid instrument and exchange ids must be provided`);
    
    let [ err, mapping ] = await to(InstrumentExchangeMapping.findOne({
        where: { instrument_id, exchange_id },
        include: [ Exchange, Instrument ]
    }));

    if(err) TE(err.message);
    if(!mapping) return null;

    [ err ] = await to(mapping.destroy());

    if(err) TE(err.message);

    return mapping;

};
module.exports.deleteExchangeMapping = deleteExchangeMapping;

const createLiquidityRequirement = async (instrument_id, periodicity, minimum_circulation, exchange_id = null) => {

    if(!_.isNumber(instrument_id) || 
    (!_.isNumber(periodicity) || periodicity < 1) || 
    (!_.isNumber(minimum_circulation) || minimum_circulation < 0)) {
        TE('instrument_id, periodicity or minimum_circulation are not valid.');
    }
    
    const existingRequirements = await InstrumentLiquidityRequirement.findAll({
        where: {
            instrument_id: instrument_id
        }
    });

    //if exchange id is provided, it should check if the instrument is mapped for that exchange.
    if(exchange_id) {

        const [ err, found_mapping ] = await to(InstrumentExchangeMapping.findOne({
            where: { instrument_id, exchange_id }
        }));

        if(err) TE(err.message);
        if(!found_mapping) TE(`Exchange with id "${exchange_id}" is not mapped to instrument with id "${instrument_id}"`);
    }

    for(let requirement of existingRequirements) {
        const exchange = requirement.exchange;

        if(!exchange) TE(`A requirement for instrument with id ${instrument_id} already exists for all exchanges`);
    
        if(exchange === exchange_id) TE(`A requirement for instrument with id ${instrument_id} and exchange with id ${exchange_id} already exists`);
    }

    const [ err, liquidity_requirement ] = await to(InstrumentLiquidityRequirement.create({
        instrument_id,
        minimum_volume: minimum_circulation,
        periodicity_in_days: periodicity,
        exchange: exchange_id
    }));

    if(err) TE(`error occurred while saving Liquidity Requirement : ${err.message}`);

    return liquidity_requirement;

};
module.exports.createLiquidityRequirement = createLiquidityRequirement;