'use strict';

const MockController = require('./MockController');
const DepositService = require('../services/DepositService');
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
 
  /// mock data below
   let {
     amount,
     deposit_management_fee
   } = req.body;
 
   let mock_data = {
     id: 1,
     quote_asset: "Bitcoin",
     exchange: "Bitstamp",
     account: "aoisdmfs392m9asdf0m0r0m8sd",
     amount: 12.33,
     investment_percentage: 9.99,
     deposit_management_fee: 4.12,
     depositor_user: "John Doe",
     status: 151
   };
 
   return ReS(res, {
     deposit: mock_data
   });
 }
 module.exports.approveDeposit = approveDeposit;

const getRecipeDeposit = async function (req, res) {

  const { deposit_id } = req.params;

  const [ err, recipe_deposit ] = await to(AdminViewService.fetchRecipeDepositView(deposit_id));
  if(err) return ReE(res, err.message, 422);
  if(!recipe_deposit) return ReE(res, `Recipe deposit with id ${deposit_id} not found`, 422);

  // mock data below

  let mock_detail = {
    id: 1,
    quote_asset: "Bitcoin",
    exchange: "Bitstamp",
    account: "aoisdmfs392m9asdf0m0r0m8sd",
    amount: 12.33,
    investment_percentage: 9.99,
    deposit_management_fee: 4.12,
    depositor_user: "John Doe",
    status: 151
  };
  
  return ReS(res, {
    recipe_deposit
  })
};
module.exports.getRecipeDeposit = getRecipeDeposit;


const getRecipeDeposits = async function (req, res) {

  const recipe_run_id = req.params.recipe_id;
  let { seq_query, sql_where } = req;

  if(recipe_run_id && _.isPlainObject(seq_query)) {
    _.isPlainObject(seq_query.where) ? seq_query.where.recipe_run_id = recipe_run_id : seq_query.where = { recipe_run_id };
    sql_where = `recipe_run_id = ${recipe_run_id}`;
  }

  let [ err, result ] = await to(AdminViewService.fetchRecipeDepositsViewDataWithCount(seq_query));
  if(err) return ReE(res, err.message, 422);

  const { data: recipe_deposits, total: count } = result;

  let footer = [];
  [ err, footer ] = await to(AdminViewService.fetchRecipeDepositsViewsFooter(sql_where));
  if(err) return ReE(res, err.message, 422);

  // mock data below

  let mock_detail = [...Array(20)].map((detail, index) => ({
    id: index,
    quote_asset: "Bitcoin",
    exchange: "Bitstamp",
    account: "aoisdmfs392m9asdf0m0r0m8sd",
    amount: 12.33,
    investment_percentage: 9.99,
    deposit_management_fee: 4.12,
    depositor_user: "John Doe",
    status: 151
  }));

  let mock_footer = MockController.create_mock_footer(mock_detail[0], 'deposits');

  return ReS(res, {
    recipe_deposits,
    footer,
    count
  })
};
module.exports.getRecipeDeposits = getRecipeDeposits;

const getRecipeDepositsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name;
  const { query } = _.isPlainObject(req.body) ? req.body : { query: '' };

  const [ err, field_vals ] = await to(AdminViewService.fetchRecipeDepositsViewHeaderLOV(field_name, query));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, {
    query: query,
    lov: field_vals
  });

};
module.exports.getRecipeDepositsColumnLOV = getRecipeDepositsColumnLOV;