'use strict';

const DepositService = require('../services/DepositService');

const submitDeposit = async function (req, res) {

 /*  let investment_run_id = req.params.investment_id,
    asset_id = req.body.asset_id,
    amount = req.body.amount;

  let [err, deposit] = await to(DepositService.saveDeposit(investment_run_id, asset_id, amount));
  if (err) return ReE(res, err.message); */

  let {
    amount,
    deposit_management_fee
  } = req.body;

  if (!amount == null || !deposit_management_fee == null)
    return ReE(res, "Please enter amount and deposit management fee!", 422);

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

  return ReS(res, {
    deposit: mock_data
  });
}
module.exports.submitDeposit = submitDeposit;

const approveDeposit = async function (req, res) {

  /*  let investment_run_id = req.params.investment_id,
     asset_id = req.body.asset_id,
     amount = req.body.amount;
 
   let [err, deposit] = await to(DepositService.saveDeposit(investment_run_id, asset_id, amount));
   if (err) return ReE(res, err.message); */
 
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
    recipe_deposit: mock_detail
  })
};
module.exports.getRecipeDeposit = getRecipeDeposit;


const getRecipeDeposits = async function (req, res) {

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

  let footer = create_mock_footer(mock_detail[0], 'deposits');


  return ReS(res, {
    recipe_deposits: mock_detail,
    footer,
    count: 20
  })
};
module.exports.getRecipeDeposits = getRecipeDeposits;