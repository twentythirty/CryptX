
'use strict';

const adminViewService = require('../services/AdminViewsService');
const ColdStorageService = require('../services/ColdStorageService');

const ColdStorageCustodian = require('../models').ColdStorageCustodian;

const { logAction } = require('../utils/ActionLogUtil');

const approveColdStorageTransfer = async function (req, res) {

  let cold_storage_transfer = req.params.transfer_id;

  if (!cold_storage_transfer)
    return ReE(res, "No coldstorage transfer ID given!");

  let mock_coldstorage_transfer = {
    id: 1,
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
  };

  return ReS(res, {
    coldstorage_transfer: mock_coldstorage_transfer
  })
} 
module.exports.approveColdStorageTransfer = approveColdStorageTransfer;

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

const getCustodians = async function (req, res) {

  /*let mock_custodians = [...Array(5)].map((cust, index) => ({
    id: index + 1,
    name: "Custodian " + (index + 1)
  }))*/

  const { seq_query } = req;

  const [ err, result ] = await to(ColdStorageCustodian.findAndCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  const { count, rows: custodians } = result;

  //let footer = create_mock_footer(mock_custodians[0], 'cold_storage');

  return ReS(res, {
    custodians,
    footer: [], //Currently wireframe doesn't show any sign of footer values.
    count
  });
};
module.exports.getCustodians = getCustodians;

const addCustodian = async (req, res) => {

  const { name } = req.body;
  const { user } = req;

  const [ err, custodian ] = await to(ColdStorageService.createCustodian(name));
  
  if(err) return ReE(res, err.message, 422);

  return ReS(res, { custodian });

};
module.exports.addCustodian = addCustodian;

const addColdstorageAccount = async function (req, res) {

  let {
    strategy_type,
    asset_id,
    custodian_id,
    address
  } = req.body;

  if (strategy_type == null || asset_id == null || custodian_id  == null || address == null)
    return ReE(res, "strategy_type, asset_id, custodian_id and address must be supplied")
  
  let mock_account = {
    id: 1, 
    asset_id: asset_id,
    asset: "Bitcoin",
    strategy_type: strategy_type,
    address: "x98m1b4B4Kdk4n2kmadmIxSaiu",
    custodian: "Custodian ID",
    balance: 32,
    balance_usd: 186800,
    update_timestamp: 1532606182713
  };

  return ReS(res, {
    account: mock_account
  });
};
module.exports.addColdstorageAccount = addColdstorageAccount;

const getColdstorageAccounts = async function (req, res) {

  let mock_accounts = [...Array(20)].map((cust, index) => ({
    id: index +1, 
    asset_id: 2,
    asset: "Bitcoin",
    strategy_type: "101",
    address: "x98m1b4B4Kdk4n2kmadmIxSaiu",
    custodian: "Custodian ID",
    balance: 32,
    balance_usd: 186800,
    update_timestamp: 1532606182713
  }));

  let footer = create_mock_footer(mock_accounts[0], 'cold_storage');

  return ReS(res, {
    accounts: mock_accounts,
    footer,
    count: mock_accounts.length
  });
};
module.exports.getColdstorageAccounts = getColdstorageAccounts;