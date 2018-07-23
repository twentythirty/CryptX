'use strict';

const adminViewService = require('../services/AdminViewsService');

const fetchColLOV = async function (req, res) {
  let lov = await adminViewService.fetchMockHeaderLOV();

  return ReS(res, {
    lov
  });
};
module.exports.fetchColLOV = fetchColLOV;

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

const getExchanges = async function (req, res) {
  
  // mock data below
  let exchanges = [...Array(7)].map((a, index) => ({
    id: index + 1,
    name: "Bitstamp"
  }));

  return ReS(res, {
    exchanges,
    count: exchanges.length
  })
}
module.exports.getExchanges = getExchanges;

const getColdStorageTransfers = async function (req, res) {

   // mock data below
  let mock_coldstorage_transfers = [...Array(20)].map((a, index) => ({
    id: index + 1,
    asset: "BTC",
    gross_amount: 12.05,
    net_amount: 14,
    exchange_withrawal_fee: 0.01,
    status: 91,
    cold_storage_account_id: "98512543",
    custodian: "ItBit",
    strategy: "MCI",
    source_exchange: "Bitstamp",
    source_account: "25439851",
    placed_timestamp: 1532097313472,
    completed_timestamp: 1532097313472
  }));

  let footer = create_mock_footer(mock_coldstorage_transfers[0], 'cold_storage');

  return ReS(res, {
    mock_coldstorage_transfers,
    count: mock_coldstorage_transfers.length,
    footer
  })
}
module.exports.getColdStorageTransfers = getColdStorageTransfers;
