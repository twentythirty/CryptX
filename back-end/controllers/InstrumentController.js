'use strict';

const instrumentService = require('../services/InstrumentsService');
const adminViewService = require('../services/AdminViewsService');
const adminViewUtils = require('../utils/AdminViewUtils');

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

  const field_vals = await adminViewService.fetchInstrumentsViewHeaderLOV(field_name, query);

  return ReS(res, {
    query: query,
    lov: field_vals
  })
};
module.exports.getInstrumentsColumnLOV = getInstrumentsColumnLOV;

const getInstruments = async function (req, res) {
   // mock data below
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

  if (!instrument_id || !exchange_id || !external_instrument_id)
    return ReE(res, "Instrument ID, exchange and external instrument ID must be specified to map", 422);

  // mock data below
  let mapping_data = {
    instrument_id,
    exchange_id,
    external_instrument_id,
    current_price: 7422.46,
    last_day_vol: 12300,
    last_week_vol: 86100,
    last_updated: 1531486061727
  };

  return ReS(res, {
    mapping_data
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

  const [error, mappings] = await to(instrumentService.addInstrumentExchangeMappings(instrument_id, exchange_mappings));

  if (error) {
    return ReE(res, error)
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
  const { data: instrument_exchanges, total: count} = await adminViewService.fetchInstrumentExchangesViewDataWithCount(seq_query);

  //add instrument id to search condition
  let sql_where = adminViewUtils.addToWhere(req.sql_where, `instrument_id = ${instrument_id}`);
  const instrument_exchanges_footer = await adminViewService.fetchInstrumentExchangesViewFooter(sql_where)

  return ReS(res, {
    count,
    mapping_data: instrument_exchanges,
    footer: instrument_exchanges_footer
  });
};
module.exports.getInstrumentExchanges = getInstrumentExchanges;


// liquidity requirements

const createLiquidityRequirement = async function (req, res) {
 
  let {
    instrument_id,
    exchange_id,
    periodicity,
    minimum_circulation
  } = req.body;

  if (!instrument_id || 
    !exchange_id || 
    !periodicity || 
    !minimum_circulation)
    return ReE(res, "Please fill all values: instrument_id, exchange_id, periodicity, minimum_circulation", 422);

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
    liquidity_requirement: liquidity_mock
  });
};
module.exports.createLiquidityRequirement = createLiquidityRequirement;

const getLiquidityRequirement = async function (req, res) {
 
  let liquidity_req_id = req.params.liquidity_requirement_id

  if (!liquidity_req_id)
    return ReE(res, "Not found", 422);

  // mock data below

  let liquidity_mock = {
    id: liquidity_req_id,
    instrument: "BTC/ETH",
    periodicity: 7,
    quote_asset: "BTC",
    minimum_circulation: 60000,
    exchange: "All exchanges",
    exchange_count: 2,
    exchange_pass: 2
  };

  return ReS(res, {
    liquidity_requirement: liquidity_mock
  });
};
module.exports.getLiquidityRequirement = getLiquidityRequirement;


const getLiquidityRequirements = async function (req, res) {
 
  // mock data below

  let liquidity_mock = [...Array(20)].map((map, index) => ({
    id: index,
    instrument: "BTC/ETH",
    periodicity: 7,
    quote_asset: "BTC",
    minimum_circulation: 60000,
    exchange: "All exchanges",
    exchange_count: 2,
    exchange_pass: 2
  }));

  let footer = await adminViewService.fetchLiquidityViewFooter();

  return ReS(res, {
    liquidity_requirements: liquidity_mock,
    count: liquidity_mock.length,
    footer  
  });
};
module.exports.getLiquidityRequirements = getLiquidityRequirements;


const getLiquidityRequirementExchanges = async function (req, res) {
 
  let liquidity_requirement_id = req.params.liquidity_requirement_id

  if (!liquidity_requirement_id)
    return ReE(res, "Not found", 422);

  // mock data below

  let liquidity_mock = [...Array(8)].map((map, index) => ({
    id: index,
    exchange_id: 1,
    exchange: "Bitstamp",
    instrument: "BTC/ETH",
    instrument_identifier: "XRP/BTC",
    last_day_vol: 12300,
    last_week_vol: 86100,
    last_updated: 1531725075560,
    passes: true 
  }));

  let footer = create_mock_footer(liquidity_mock, 'liquidity')

  return ReS(res, {
    exchanges: liquidity_mock,
    count: liquidity_mock.length,
    footer
  });
};
module.exports.getLiquidityRequirementExchanges = getLiquidityRequirementExchanges;

const create_mock_footer = function (keys, name) {
  // delete this function after mock data is replaced
  let footer = [...Object.keys(keys)].map((key, index) => {
    return {
      "name": key,
      "value": 999,
      "template": name + ".footer." + key,
      "args": {
          [key]: 999
      }
    }
  });
  return footer;
};