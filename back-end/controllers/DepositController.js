'use strict';

const DepositService = require('../services/DepositService');
const adminViewUtils = require('../utils/AdminViewUtils');
const AdminViewService = require('../services/AdminViewsService');
const ActionLog = require('../models').ActionLog;

const translation = require('../public/fe/i18n/en.json'); //temp posibbly

const submitDeposit = async function (req, res) {

  const { deposit_id } = req.params;

  const user = req.user;

  let [ err, deposit_result ] = await to(DepositService.submitDeposit(deposit_id, user, req.body));  
  if(err) return ReE(res, err.message, 422);
  if(!deposit_result) return ReE(res, `Deposit with id ${deposit_id} was not found`, 404);

  let { original_deposit, updated_deposit: deposit } = deposit_result;

  deposit = deposit.toWeb();
  deposit.deposit_management_fee = deposit.fee; 
  delete deposit.fee;

  return ReS(res, {
    deposit
  });

}
module.exports.submitDeposit = submitDeposit;

const approveDeposit = async function (req, res) {

  const deposit_id = req.params.deposit_id;
  const user = req.user;

  let [ err, deposit_result ] = await to(DepositService.approveDeposit(deposit_id, user.id));  
  if(err) return ReE(res, err.message, 422);
  if(!deposit_result) return ReE(res, `Deposit with id ${deposit_id} was not found`, 404);

  let { original_deposit, updated_deposit: deposit } = deposit_result;

  await user.logAction('modified', { 
    previous_instance: original_deposit, 
    updated_instance: deposit,
    ignore: ['completion_timestamp', 'depositor_user_id'],
    replace: { status: { 
      [RECIPE_RUN_DEPOSIT_STATUSES.Pending]: `{deposits.status.${RECIPE_RUN_DEPOSIT_STATUSES.Pending}}`, 
      [RECIPE_RUN_DEPOSIT_STATUSES.Completed]: `{deposits.status.${RECIPE_RUN_DEPOSIT_STATUSES.Completed}}`,
    } }
  });

  deposit = deposit.toWeb();
  deposit.depositor_user = user.fullName();
  deposit.deposit_management_fee = deposit.fee; 
  delete deposit.fee;

  return ReS(res, {
    deposit
  });
}
module.exports.approveDeposit = approveDeposit;

const getRecipeDeposit = async function (req, res) {

  const { deposit_id } = req.params;

  const [err, result] = await to(Promise.all([
    AdminViewService.fetchRecipeDepositView(deposit_id),
    ActionLog.findAll({
      where: { recipe_run_deposit_id: deposit_id },
      attributes: ['id', 'details', 'timestamp', 'level', 'translation_key', 'translation_args'],
      order: [ [ 'timestamp', 'DESC' ] ]
    })
  ]));
  if (err) return ReE(res, err.message, 422);

  let [ recipe_deposit, action_logs ] = result;

  action_logs = action_logs.map(a => a.toWeb());

  if (!recipe_deposit) return ReE(res, `Recipe deposit with id ${deposit_id} not found`, 422);

  return ReS(res, {
    recipe_deposit,
    action_logs
  })
};
module.exports.getRecipeDeposit = getRecipeDeposit;


const getRecipeDeposits = async function (req, res) {

  const recipe_run_id = req.params.recipe_id;
  let { seq_query, sql_where } = req;

  let fetch_footer_percentage = false;

  if (recipe_run_id && _.isPlainObject(seq_query)) {
    fetch_footer_percentage = true;
    if (!_.isPlainObject(seq_query)) seq_query = { where: {} };
    if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
    seq_query.where.recipe_run_id = recipe_run_id;
    sql_where = adminViewUtils.addToWhere(sql_where, `recipe_run_id = ${recipe_run_id}`);
  }

  let [err, result] = await to(AdminViewService.fetchRecipeDepositsViewDataWithCount(seq_query));
  if (err) return ReE(res, err.message, 422);

  const { data: recipe_deposits, total: count } = result;

  let footer = [];
  [err, footer] = await to(AdminViewService.fetchRecipeDepositsViewsFooter(sql_where, fetch_footer_percentage));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    recipe_deposits,
    footer,
    count
  })
};
module.exports.getRecipeDeposits = getRecipeDeposits;

const getInvestmentRunDeposits = async function (req, res) {

  const investment_run_id = req.params.investment_run_id;

  let { seq_query, sql_where } = req;

  if (!_.isPlainObject(seq_query)) seq_query = { where: {} };
  if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
  seq_query.where.investment_run_id = investment_run_id;
  sql_where = adminViewUtils.addToWhere(sql_where, `investment_run_id = ${investment_run_id}`);

  let [err, result] = await to(AdminViewService.fetchRecipeDepositsViewDataWithCount(seq_query));
  if (err) return ReE(res, err.message, 422);

  const { data: recipe_deposits, total: count } = result;

  let footer = [];
  [err, footer] = await to(AdminViewService.fetchRecipeDepositsViewsFooter(sql_where));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    recipe_deposits,
    footer,
    count
  })
}
module.exports.getInvestmentRunDeposits = getInvestmentRunDeposits;

const getRecipeDepositsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [err, field_vals] = await to(AdminViewService.fetchRecipeDepositsViewHeaderLOV(field_name, query, req.sql_where));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  });

};
module.exports.getRecipeDepositsColumnLOV = getRecipeDepositsColumnLOV;

const getRecipeRunAssetConversions = async (req, res) => {

  const { recipe_id } = req.params;
  let { seq_query, sql_where } = req;

  seq_query.where.recipe_run_id = recipe_id;

  if(sql_where !== '') sql_where += ' AND ';
  sql_where += `recipe_run_id = ${recipe_id}`;

  const [ err, result ] = await to(Promise.all([
    AdminViewService.fetchInvestmentAssetConversionsViewDataWithCount(seq_query),
    AdminViewService.fetchInvestmentAssetConversionViewFooter(sql_where)
  ]));

  if(err) return ReE(res, err.message, 422);

  const [ data_with_count, footer ] = result;
  const { data: conversions, total: count } = data_with_count;

  return ReS(res, {
    conversions,
    count,
    footer
  });

};
module.exports.getRecipeRunAssetConversions = getRecipeRunAssetConversions;

const submitAssetConversion = async (req, res) => {

  updateAssetConversion(req, res, false);

};
module.exports.submitAssetConversion = submitAssetConversion;

const completeAssetConversion = async (req, res) => {

  updateAssetConversion(req, res, true);

};
module.exports.completeAssetConversion = completeAssetConversion;

const updateAssetConversion = async (req, res, complete = false) => {

  const { conversion_id } = req.params;
  const { amount } = req.body;
  const { user } = req;

  let [ err, conversion ] = await to(DepositService.submitAssetConversion(conversion_id, amount, user, complete));

  if(err) return ReE(res, err.message, 422);
  if(!conversion) return ReE(res, `Asset conversion with id "${conversion_id}" was not found`, 404);

  [ err, conversion ] = await to(AdminViewService.fetchInvestmentAssetConversionView(conversion_id));

  if(err) return ReE(res, err.message, 422);

  return ReS(res, { conversion });

}