'use strict';

const createInstrument = async function (req, res) {
 
  // mock data below
  let {
    transaction_asset_id,
    quote_asset_id
  } = req.body;

  if (!transaction_asset_id || !quote_asset_id)
    return ReE(res, "Both assets must be specified to create an instrument", 422);

  let instrument_mock = {
    id: 1,
    transaction_asset_id: 28,
    quote_asset_id: 2,
    symbol: "BTC/XRP"
  };

  return ReS(res, {
    instrument: instrument_mock
  });
};
module.exports.createInstrument = createInstrument;

const getInstrument = async function (req, res) {

  // mock data below
  let instrument_id = req.params.instrument_id;

  let instrument_mock = {
    id: 1,
    transaction_asset_id: 28,
    quote_asset_id: 2,
    symbol: "BTC/XRP",
    exchanges_connected: 4,
    exchanges_connected: 3
  };

  return ReS(res, {
    instrument: instrument_mock
  });
};
module.exports.getInstrument = getInstrument;

const getInstruments = async function (req, res) {

  let instruments_mock = [...Array(20)].map((i, index) => ({
      id: index + 1,
      transaction_asset_id: 28,
      quote_asset_id: 2,
      symbol: "BTC/XRP",
      exchanges_connected: 4,
      exchanges_failed: 3
  }));

  let footer = [
    {
      "name": "id",
      "value": "999"
    },
    {
      "name": "transaction_asset_id",
      "value": "999"
    },
    {
      "name": "quote_asset_id",
      "value": "999"
    },
    {
      "name": "symbol",
      "value": "999"
    },
    {
      "name": "exchanges_connected",
      "value": "999"
    },
    {
      "name": "exchanges_failed",
      "value": "999"
    }
  ];

  return ReS(res, {
    instruments: instruments_mock,
    footer,
    count: instruments_mock.length
  });
};
module.exports.getInstruments = getInstruments;

/** Route to check if instrument can be mapped with exchange. If yes, information
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
  let exchange_mapping = req.body.exchange_mapping;

  if (!exchange_mapping.length && !instrument_id)
    return ReE(res, "Instrument ID and exchange mappings must be supplied to map exchanges with instrument", 422);

  // enforce specific exchange mapping structure
  if (!exchange_mapping.every((map) => {
    return typeof map === 'object' && map.exchange_id && map.external_identifier;
  }));

  return ReS(res, {
    message: "OK!"
  });
};
module.exports.mapInstrumentsWithExchanges = mapInstrumentsWithExchanges;

const getInstrumentExchanges = async function (req, res) {

  // mock data belows
  let instrument_id = req.params.instrument_id;

  let mapping_data = [...Array(8)].map((map, index) => ({
    instrument_id,
    exchange_id: index,
    exchange_name: "Bitstamp" + index,
    external_instrument_id,
    current_price: 7422.46,
    last_day_vol: 12300,
    last_week_vol: 86100,
    last_updated: 1531486061727,
    liquidity_rules: 3
  }));

  return ReS(res, {
    mapping_data
  });
};
module.exports.getInstrumentExchanges = getInstrumentExchanges;
