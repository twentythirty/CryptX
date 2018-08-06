'use strict';

const MockController = require('./MockController');
const DepositService = require('../services/DepositService');
const adminViewUtils = require('../utils/AdminViewUtils');
const AdminViewService = require('../services/AdminViewsService');

const submitDeposit = async function (req, res) {

  /*  let investment_run_id = req.params.investment_id,
     asset_id = req.body.asset_id,
     amount = req.body.amount;
 
     // this same method could be rewriten to save deposit data in recipe_run_deposit table.
   let [err, deposit] = await to(DepositService.saveDeposit(investment_run_id, asset_id, amount));
   if (err) return ReE(res, err.message); */

  let {
    amount,
    deposit_management_fee
  } = req.body;

  if (!amount == null || !deposit_management_fee == null)
    return ReE(res, "Please enter amount and deposit management fee!", 422);

  /// mock data below

  let mock_data = {
    id: 1,
    quote_asset: "Bitcoin",
    exchange: "Bitstamp",
    account: "aoisdmfs392m9asdf0m0r0m8sd",
    amount: amount,
    investment_percentage: 9.99,
    deposit_management_fee: deposit_management_fee,
    depositor_user: "John Doe",
    status: 151
  };


  let log = [
    {
      timestamp: 1532602669656,
      user_id: 23,
      user: "Some user",
      details: "changed amount from 13.45 to 14.85"
    },
    {
      timestamp: 1532602669656,
      user_id: 23,
      user: "Some user",
      details: "changed deposit management fee from - to 4.12"
    },
    {
      timestamp: 1532602669656,
      user_id: 23,
      user: "Some user",
      details: "changed status from pending to approved"
    }
  ]

  return ReS(res, {
    deposit: mock_data
  });
}
module.exports.submitDeposit = submitDeposit;

const approveDeposit = async function (req, res) {

  const deposit_id = req.params.deposit_id;
  const user = req.user;

  let [ err, deposit_result ] = await to(DepositService.approveDeposit(deposit_id, user.id, req.body));  
  if(err) return ReE(res, err.message, 422);
  if(!deposit_result) return ReE(res, `Deposit with id ${deposit_id} was not found`, 404);

  let { original_deposit, updated_deposit: deposit } = deposit_result;

  deposit = deposit.toWeb();
  deposit.depositor_user = user.fullName();
  deposit.deposit_management_fee = deposit.fee; 
  delete deposit.fee;
  
  /*user.logAction(`${user.fullName()} completed deposit with ID: ${deposit.id}, management fee was to ${deposit.deposit_management_fee} and the amount set to ${deposit.amount}.`, {
    relations: { recipe_run_deposit_id: deposit.id }
  });*/
  
  user.logAction(`${user.fullName()} changed Amount from ${original_deposit.amount || '-'} to ${deposit.amount}`, {
    relations: { recipe_run_deposit_id: deposit.id }
  });
  user.logAction(`${user.fullName()} changed Deposit management fee from ${original_deposit.fee || '-'} to ${deposit.deposit_management_fee}`, {
    relations: { recipe_run_deposit_id: deposit.id }
  });
  user.logAction(`${user.fullName()} changed Status from ${original_deposit.status} to ${deposit.status}`, {
    relations: { recipe_run_deposit_id: deposit.id }
  });
  

  return ReS(res, {
    deposit
  });
}
module.exports.approveDeposit = approveDeposit;

const getRecipeDeposit = async function (req, res) {

  const { deposit_id } = req.params;

  const [err, recipe_deposit] = await to(AdminViewService.fetchRecipeDepositView(deposit_id));
  if (err) return ReE(res, err.message, 422);
  if (!recipe_deposit) return ReE(res, `Recipe deposit with id ${deposit_id} not found`, 422);

  return ReS(res, {
    recipe_deposit
  })
};
module.exports.getRecipeDeposit = getRecipeDeposit;


const getRecipeDeposits = async function (req, res) {

  const recipe_run_id = req.params.recipe_id;
  let { seq_query, sql_where } = req;

  if (recipe_run_id && _.isPlainObject(seq_query)) {
    if (!_.isPlainObject(seq_query)) seq_query = { where: {} };
    if (!_.isPlainObject(seq_query.where)) seq_query.where = {};
    seq_query.where.recipe_run_id = recipe_run_id;
    sql_where = adminViewUtils.addToWhere(sql_where, `recipe_run_id = ${recipe_run_id}`);
  }

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

  const [err, field_vals] = await to(AdminViewService.fetchRecipeDepositsViewHeaderLOV(field_name, query));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  });

};
module.exports.getRecipeDepositsColumnLOV = getRecipeDepositsColumnLOV;