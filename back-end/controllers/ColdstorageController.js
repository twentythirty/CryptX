
'use strict';

const AdminViewsService = require('../services/AdminViewsService');
const ColdStorageService = require('../services/ColdStorageService');

const ColdStorageCustodian = require('../models').ColdStorageCustodian;

const { logAction } = require('../utils/ActionLogUtil');

const { lock } = require('../utils/LockUtils');

const approveColdStorageTransfer = async function (req, res) {

  const { transfer_id } = req.params;
  const { user } = req;

  const [ err, transfer ] = await to(ColdStorageService.changeTransferStatus(parseInt(transfer_id), COLD_STORAGE_ORDER_STATUSES.Approved, user));

  if(err) return ReE(res, err.message, 422);
  if(!transfer) return ReE(res, `Cold Storage Transfer with id ${transfer_id} was not found`);

  return ReS(res, {
    status: `cold_storage.transfers.status.${transfer.status}`
  });
}
module.exports.approveColdStorageTransfer = approveColdStorageTransfer;

const getColdStorageTransfers = async function (req, res) {

  const { seq_query, sql_where } = req;

  let [ err, result ] = await to(AdminViewsService.fetchColdStorageTransferViewDataWithCount(seq_query));

  if(err) return ReE(res, err.message, 422);

  let { total: count, data: transfers } = result;

  transfers = transfers.map(cst => cst.toWeb());

  let footer = [];
  [ err, footer ] = await to(AdminViewsService.fetchColdStorageTransfersViewsFooter(sql_where));

  return ReS(res, {
    transfers,
    count,
    footer
  })
}
module.exports.getColdStorageTransfers = getColdStorageTransfers;

const getColdStorageTransferColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(AdminViewsService.fetchColdStorageTransfersViewHeaderLOV(field_name, query, req.sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

};
module.exports.getColdStorageTransferColumnLOV = getColdStorageTransferColumnLOV;

const getCustodians = async function (req, res) {

  const { seq_query } = req;

  const [err, result] = await to(ColdStorageCustodian.findAndCount(seq_query));
  if (err) return ReE(res, err.message, 422);

  const { count, rows: custodians } = result;


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

  const [ err, custodian ] = await to(
    lock(ColdStorageService, {
      method: 'createCustodian',
      params: [ name ],
      id: 'create_cold_storage_custodian',
      keys: { name },
      error_message: 'A cold storage custodian is currently being added with that name. Please wait...',
      max_block: 180
    })
  );

  if (err) return ReE(res, err.message, 422);

  return ReS(res, { custodian });

};
module.exports.addCustodian = addCustodian;

const addColdstorageAccount = async function (req, res) {

  let {
    strategy_type,
    asset_id,
    custodian_id,
    address,
    tag
  } = req.body;

  if (strategy_type == null || asset_id == null || custodian_id == null || address == null)
    return ReE(res, "strategy_type, asset_id, custodian_id and address must be supplied")

  const [ err, account ] = await to(
    lock(ColdStorageService, {
      method: 'createColdStorageAccount',
      params: [ strategy_type, asset_id, custodian_id, address, tag ],
      id: 'create_cold_storage_account',
      keys: { strategy_type, asset_id, custodian_id },
      error_message: 'A cold storage account is currently being added with those selections. Please wait...',
      max_block: 180
    })
  );

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    account
  });
};
module.exports.addColdstorageAccount = addColdstorageAccount;

const editColdStorageAccount = async (req, res) => {

  const { address, tag } = req.body;
  const { account_id } = req.params;

  const [ err, account ] = await to(ColdStorageService.editColdStorageAccount(account_id, address, tag));

  if(err) return ReE(res, err.message, 422);
  if(!account) return ReE(res, `Account was not found with id "${account_id}"`, 404);

  return ReS(res, { account });

};
module.exports.editColdStorageAccount = editColdStorageAccount;

const getColdstorageAccounts = async function (req, res) {

  const { seq_query, sql_where } = req;

  let [ err, result ] = await to(AdminViewsService.fetchColdStorageAccountsViewDataWithCount(seq_query));

  if(err) return ReE(res, err.message, 422);

  let { total: count, data: accounts } = result;

  let footer = [];
  [ err, footer ] = await to(AdminViewsService.fetchColdStorageAccountsViewsFooter(sql_where));

  if(err) return ReE(res, err.message, 422);

  accounts = accounts.map(a => a.toWeb());

  return ReS(res, {
    accounts,
    footer,
    count
  });
  
};
module.exports.getColdstorageAccounts = getColdstorageAccounts;

const getColdstorageAccountsFees = async (req, res) => {

  //MOCK DATA
  /*
  let fees = [];
  const assets = ['ETH', 'BTC', 'DOGE', 'XRP', 'BRT', 'XPX', 'RBT', 'ARP', 'WAWE'];
  const custodian = ['Coinbase', 'Cointop', 'Little Inc', 'Big Crypto', '2030 Ltd', 'Really Long Coins and Jebs'];
  for(let i = 0; i < _.random(9, 30, false); i++) {
    
    fees.push({
      id: i,
      creation_timestamp: Date.now(),
      amount: _.random(1, 20, true),
      asset: assets[_.random(0, assets.length - 1, false)],
      cold_storage_account_id: _.random(1, 99, false),
      custodian: custodian[_.random(0, custodian.length - 1, false)],
      strategy_type: `investment.strategy.${_.random(101, 102, false)}`
    });

  }
  */

 const { seq_query, sql_where } = req;

  const [ err, result ] = await to(AdminViewsService.fetchColdStorageAccountStorageFeesViewDataWithCount(seq_query));

  if(err) return ReE(res, err.message, 422);

  let { data: fees, total: count } = result;

  fees = fees.map(fee => fee.toWeb());

  return ReS(res, {
    fees,
    count,
    footer: []
  });

};
module.exports.getColdstorageAccountsFees = getColdstorageAccountsFees;

const getColdstorageAccountsFeeColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(AdminViewsService.fetchColdStorageAccountStorageFeesViewHeaderLOV(field_name, query, req.sql_where));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  })

};
module.exports.getColdstorageAccountsFeeColumnLOV = getColdstorageAccountsFeeColumnLOV;