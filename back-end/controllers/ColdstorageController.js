
'use strict';

const AdminViewsService = require('../services/AdminViewsService');
const ColdStorageService = require('../services/ColdStorageService');

const ColdStorageCustodian = require('../models').ColdStorageCustodian;

const { logAction } = require('../utils/ActionLogUtil');

const approveColdStorageTransfer = async function (req, res) {

  const { transfer_id } = req.params;
  const { user } = req.user;

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

  const [err, result] = await to(ColdStorageCustodian.findAndCount(seq_query));
  if (err) return ReE(res, err.message, 422);

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

  const [err, custodian] = await to(ColdStorageService.createCustodian(name));

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

  let [err, account] = await to(ColdStorageService.createColdStorageAccount(strategy_type, asset_id, custodian_id, address, tag));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    account
  });
};
module.exports.addColdstorageAccount = addColdstorageAccount;

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