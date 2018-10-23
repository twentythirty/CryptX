'use strict';

const ExchangeService = require('../services/ExchangeService');
const AdminViewService = require('../services/AdminViewsService');

const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;

const getExchanges = async function (req, res) {
  //return partial list of exchanges if ignore_unmappable is present
  let seq_query = req.seq_query || { where: {} };
  const fetch_exclusive = req.query.ignore_unmappable == 'true' || false;
  if (fetch_exclusive) {
    seq_query.where.is_mappable = true;
  } else {
    delete seq_query.where.is_mappable;
  }
  
  let [err, result] = await to(Exchange.findAndCountAll(seq_query));

  if (err) return ReE(res, err, 422);

  let { rows: exchanges, count} = result;

  return ReS(res, {
    exchanges: exchanges.map(e => e.toWeb()),
    count
  })
}
module.exports.getExchanges = getExchanges;

const createExchangeAccount = async (req, res) => {

  const { exchange_id } = req.params; 
  const { account_type, asset_id, address, is_active } = req.body;

  const [ err, exchange_account ] = await to(ExchangeService.createExchangeAccount(account_type, asset_id, exchange_id, address, is_active));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, { exchange_account });

};
module.exports.createExchangeAccount= createExchangeAccount;

const editExchangeAccount = async (req, res) => {

  const { exchange_account_id } = req.params; 
  const { is_active } = req.body;

  const [ err, exchange_account ] = await to(ExchangeService.editExchangeAccount(exchange_account_id, is_active));
  if(err) return ReE(res, err.message, 422);
  if(!exchange_account) return ReE(res, `Exchange account with id ${exchange_account_id} was not found`);

  return ReS(res, { message: 'OK!' });

};
module.exports.editExchangeAccount= editExchangeAccount;

const getExchangeAccounts = async (req, res) => {

  const { seq_query, sql_where } = req;

  let [ err, result ] = await to(Promise.all([
    AdminViewService.fetchExchangeAccountsViewDataWithCount(seq_query),
    AdminViewService.fetchExchangeAccountViewFooter(sql_where)
  ]));

  if(err) return ReE(res, err, 422);

  const [ data_with_count, footer ] = result;
  const { data: exchange_accounts, total: count } = data_with_count;
  
  return ReS(res, {
    exchange_accounts,
    footer,
    count
  });

};
module.exports.getExchangeAccounts = getExchangeAccounts;

const getExchangeAccount = async (req, res) => {

  const { exchange_account_id } = req.params;

  let [ err, exchange_account ] = await to(AdminViewService.fetchExchangeAccountView(exchange_account_id));

  if(err) return ReE(res, err, 422);
  if(!exchange_account) return ReE(res, `Exchange account was not found with id ${exchange_account_id}`, 404);

  return ReS(res, { exchange_account });

};
module.exports.getExchangeAccount = getExchangeAccount;

const getExchangeAccountsColumnLOV = async (req, res) => {

  const { field_name } = req.params;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const field_vals = await AdminViewService.fetchExchangeAccountsViewHeaderLOV(field_name, query, req.sql_where);

  return ReS(res, {
    query: query,
    lov: field_vals
  })
};
module.exports.getExchangeAccountsColumnLOV = getExchangeAccountsColumnLOV;

const setExchangeCredentials = async (req, res) => {

  const { exchange_id } = req.params;
  const { api_key, api_secret, admin_password } = req.body;

  const [ err, result ] = await to(ExchangeService.setExchangeCredentials(exchange_id, api_key, api_secret, admin_password));

  if(err) return ReE(res, err.message, 422);
  if(!result) return ReE(res, `Exchange with id ${exchange_id} was not found`, 404);

  return ReS(res, { message: 'OK!' });

};
module.exports.setExchangeCredentials = setExchangeCredentials;

const getExchangeCredentials = async (req, res) => {

  const { seq_query, sql_where } = req;

  const [ err, result ] = await to(ExchangeService.getExchangeCredentials());

  if(err) return ReE(res, err, 422);

  const { exchange_credentials, footer } = result;

  return ReS(res, {
    exchange_credentials,
    count: exchange_credentials.length,
    footer
  });

};
module.exports.getExchangeCredentials = getExchangeCredentials;

const getExchangeCredential = async (req, res) => {

  const { exchange_id } = req.params;

  const [ err, result ] = await to(ExchangeService.getExchangeCredentials(exchange_id));

  if(err) return ReE(res, err.message, 422);
  if(!result) return ReE(res, `Exchange credentials are not set for Exchange with id ${exchange_id}`, 404);

  const { exchange_credentials: exchange_credential } = result;

  return ReS(res, { exchange_credential });

};
module.exports.getExchangeCredential = getExchangeCredential;