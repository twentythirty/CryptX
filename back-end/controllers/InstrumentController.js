'use strict';

const instrumentService = require('../services/InstrumentsService');
const adminViewService = require('../services/AdminViewsService');
const adminViewUtils = require('../utils/AdminViewUtils');

const InstrumentLiquidityRequirement = require('../models').InstrumentLiquidityRequirement;

const createInstrument = async function (req, res) {
 
  let {
    transaction_asset_id,
    quote_asset_id
  } = req.body;

  if (!transaction_asset_id || !quote_asset_id)
    return ReE(res, "Both assets must be specified to create an instrument", 422);
  
  const [err, instrument] = await to(instrumentService.createInstrument(transaction_asset_id, quote_asset_id));
  if (err) {
    return ReE(res, err, 422);
  }

  return ReS(res, {
    instrument: instrument
  });
};
module.exports.createInstrument = createInstrument;

const getInstrument = async function (req, res) {

  let instrument_id = req.params.instrument_id;
  
  const instrument = await adminViewService.fetchInstrumentView(instrument_id);

  return ReS(res, {
    instrument: instrument
  });
};
module.exports.getInstrument = getInstrument;

const getInstrumentsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name
  const { query } = _.isPlainObject(req.body)? req.body : { query: '' };

  const field_vals = await adminViewService.fetchInstrumentsViewHeaderLOV(field_name, query, req.sql_where);

  return ReS(res, {
    query: query,
    lov: field_vals
  })
};
module.exports.getInstrumentsColumnLOV = getInstrumentsColumnLOV;

const getInstruments = async function (req, res) {

  const instruments_and_count = await adminViewService.fetchInstrumentsViewDataWithCount(req.seq_query);

  const { data: instruments, total: count } = instruments_and_count;

  let footer = await adminViewService.fetchInstrumentsViewFooter(req.sql_where);

  return ReS(res, {
    instruments,
    count,
    footer
  });
};
module.exports.getInstruments = getInstruments;

/** Controller for checking if instrument can be mapped with exchange. If yes, information
 * from exchange is returned.
*/
const checkInstrumentExchangeMap = async function (req, res) {
  
  let instrument_id = req.params.instrument_id;

  let {
    exchange_id,
    external_instrument_id
  } = req.body;

  if (!exchange_id || !external_instrument_id)
    return ReE(res, "Instrument ID, exchange and external instrument ID must be specified to map", 422);

  let [err, mapping_status] = await to(instrumentService.checkIfCCXTMarketExist(exchange_id, external_instrument_id));
  if (err) return ReE(res, err.message);

  return ReS(res, {
    mapping_status
  });
};
module.exports.checkInstrumentExchangeMap = checkInstrumentExchangeMap;

const mapInstrumentsWithExchanges = async function (req, res) {

  let instrument_id = req.params.instrument_id;
  let exchange_mappings = req.body.exchange_mapping;

  if (!_.isArray(exchange_mappings) || !instrument_id)
    return ReE(res, "Instrument ID and exchange mappings array must be supplied to map exchanges with instrument", 422);

  // enforce specific exchange mapping structure
  if (!exchange_mappings.every((map) => {
    return _.isObject(map) && map.exchange_id && map.external_instrument_id;
  })) {
   return ReE(res, `Supplied array of exchange mappings ${exchange_mappings} is supposed to contain exchange_id and external_intrument_id keys!`) 
  };

  const [error, mappings] = await to(instrumentService.addInstrumentExchangeMappings(instrument_id, exchange_mappings, req.user));

  if (error) {
    return ReE(res, error, 422)
  }

  return ReS(res, {
    message: "OK!"
  });
};
module.exports.mapInstrumentsWithExchanges = mapInstrumentsWithExchanges;

const getInstrumentExchanges = async function (req, res) {
 
  const instrument_id = req.params.instrument_id;
  const seq_query = Object.assign({ where: {} }, req.seq_query);
  //add instrument id to search conditions
  seq_query.where['instrument_id'] = instrument_id;
  let { data: instrument_exchanges, total: count} = await adminViewService.fetchInstrumentExchangesViewDataWithCount(seq_query);

  //add instrument id to search condition
  let sql_where = adminViewUtils.addToWhere(req.sql_where, `instrument_id = ${instrument_id}`);
  const instrument_exchanges_footer = await adminViewService.fetchInstrumentExchangesViewFooter(sql_where)

  instrument_exchanges = await Promise.all(instrument_exchanges.map(ie => ie.toWeb()));

  return ReS(res, {
    count,
    mapping_data: instrument_exchanges,
    footer: instrument_exchanges_footer
  });
};
module.exports.getInstrumentExchanges = getInstrumentExchanges;

const getIdentifiersForInstrument = async function (req, res) {

  let exchange_id = req.params.exchange_id;

  let [err, identifiers] = await to(instrumentService.getInstrumentIdentifiersFromCCXT(exchange_id, req.query.q));
  if (err) return ReE(res, err.message);

  return ReS(res, {
    identifiers
  });
};
module.exports.getIdentifiersForInstrument = getIdentifiersForInstrument;

const removeInstrumentExchangeMapping = async (req, res) => {

  const { instrument_id, exchange_id } = req.params;
  const { user } = req;

  const [ err, mapping ] = await to(instrumentService.deleteExchangeMapping(parseInt(instrument_id), parseInt(exchange_id)));

  if(err) return ReE(res, err.message, 422);
  if(!mapping) return ReE(res, `Instrument exchange mappign with instrument id "${instrument_id}" and exchange id "${exchange_id}" was not found.`, 404);

  user.logAction('instruments.mapping_removed', { 
    args: {
      identifier: mapping.external_instrument_id,
      exchange: mapping.Exchange.name,
      instrument: mapping.Instrument.symbol
    },
    relations: { instrument_id }
  });
  
  const message = `Instrument exchange mapping was removed successfully`;
  return ReE(res, { message });

}
module.exports.removeInstrumentExchangeMapping = removeInstrumentExchangeMapping;


// liquidity requirements

const createLiquidityRequirement = async function (req, res) {
 
  let {
    instrument_id,
    exchange_id,
    periodicity,
    minimum_circulation
  } = req.body;

  if (!instrument_id || 
    //!exchange_id || 
    !periodicity || 
    !minimum_circulation)
    return ReE(res, "Please fill all values: instrument_id, periodicity, minimum_circulation", 422);
  
  const [ err, liquidity_requirement ] = await to(instrumentService.createLiquidityRequirement(instrument_id, periodicity, minimum_circulation, exchange_id));
  if(err) return ReE(res, err.message, 422);

  // mock data below

  let liquidity_mock = {
    id: 1,
    instrument_id: instrument_id,
    instrument: "BTC/ETH",
    periodicity: 7,
    quote_asset: "BTC",
    minimum_circulation: 60000,
    exchange: "All exchanges",
    exchange_count: 2,
    exchange_pass: 2
  };

  return ReS(res, {
    liquidity_requirement
  });
};
module.exports.createLiquidityRequirement = createLiquidityRequirement;

const getLiquidityRequirement = async function (req, res) {
 
  const liquidity_req_id = req.params.liquidity_requirement_id

  const [ err, liquidity_requirement ] = await to(adminViewService.fetchInstrumentLiquidityRequirementView(liquidity_req_id));
  if(err) return ReE(res, err.message, 422);
  if(!liquidity_requirement) return ReE(res, `Liquidity requirement with id ${liquidity_req_id} was not found`);

  return ReS(res, {
    liquidity_requirement
  });
};
module.exports.getLiquidityRequirement = getLiquidityRequirement;


const getLiquidityRequirements = async function (req, res) {
 
  const { seq_query, sql_where } = req;

  let [ err, result ] = await to(adminViewService.fetchInstrumentLiquidityRequirementsViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  let footer = [];
  [ err, footer ] = await to(adminViewService.fetchLiquidityViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  const { total: count, data: liquidity_requirements } = result;

  return ReS(res, {
    liquidity_requirements,
    count,
    footer  
  });
};
module.exports.getLiquidityRequirements = getLiquidityRequirements;

const getLiquidityRequirementsColumnLOV = async function (req, res) {

  const field_name = req.params.field_name
  const { query } = _.isPlainObject(req.body)? req.body : { query: '' };

  const field_vals = await adminViewService.fetchInstrumentLiquidityRequirementsViewHeaderLOV(field_name, query, req.sql_where);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

}
module.exports.getLiquidityRequirementsColumnLOV = getLiquidityRequirementsColumnLOV;

const getLiquidityRequirementExchanges = async function (req, res) {
 
  const liquidity_requirement_id = req.params.liquidity_requirement_id

  let [ err, liquidity_requirement ] = await to(InstrumentLiquidityRequirement.findById(liquidity_requirement_id));
  if(err) return ReE(res, err.message, 422);
  if(!liquidity_requirement) return ReE(res, `Liquidity requirement with id ${liquidity_requirement_id} was not found`, 422);

  const seq_query = {
    where: { instrument_id: liquidity_requirement.instrument_id }
  };

  let sql_where = `instrument_id=${liquidity_requirement.instrument_id}`;

  if(liquidity_requirement.exchange) {
    seq_query.where.exchange_id = liquidity_requirement.exchange;
    sql_where += ` AND exchange_id=${liquidity_requirement.exchange}`
  }

  let result;
  [ err, result ] = await to(adminViewService.fetchLiquidityExchangesViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  let { data: exchanges, total: count } = result;

  exchanges = exchanges.map(ex => ex.toWeb());

  let footer = [];
  [ err, footer ] = await to(adminViewService.fetchLiquidityExchangesViewFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    exchanges,
    count,
    footer
  });
};
module.exports.getLiquidityRequirementExchanges = getLiquidityRequirementExchanges;
