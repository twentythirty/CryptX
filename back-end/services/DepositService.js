'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;
const Asset = require('../models').Asset;

const { logAction } = require('../utils/ActionLogUtil'); 

const saveDeposit = async function (investment_run_id, asset_id, amount) {

  let investment_run = await InvestmentRun.findById(investment_run_id);
  if (!investment_run) TE('Investment run not found');

  let asset = await Asset.findById(asset_id);

  if (!asset || !asset.is_base)
    TE('Asset not usable for deposits');

  let [err, deposit] = await to(InvestmentRunDeposit.create({
    investment_run_id: investment_run.id,
    asset_id: asset_id,
    amount: amount
  }));

  if (err) TE(err.message);

  return deposit;
}
module.exports.saveDeposit = saveDeposit;


const generateRecipeRunDeposits = async function (approved_recipe_run) {

  if (!approved_recipe_run
    || approved_recipe_run.status == null
    || approved_recipe_run.status !== RECIPE_RUN_STATUSES.Approved) {

    TE(`Bad input! submitted input must be a recipe run object with status ${RECIPE_RUN_STATUSES.Approved} (Approved)! GOt: ${approved_recipe_run}`)
  }



}
module.exports.generateRecipeRunDeposits = generateRecipeRunDeposits;

const approveDeposit = async (deposit_id, user_id, updated_values = {}) => {
  const { deposit_management_fee, amount } = updated_values;

  if (!deposit_management_fee ||
    !_.isNumber(deposit_management_fee) ||
    deposit_management_fee < 0 ||
    !amount ||
    !_.isNumber(amount) ||
    amount < 0) TE('To confirm a deposit, a posotive fee and amount must be specified');

  let [err, deposit] = await to(RecipeRunDeposit.findById(deposit_id));

  if (err) TE(err.message);
  if (!deposit) return null;
  if (deposit.status !== MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending) TE(`Deposit confirmation is only allowed for Pending deposits.`);
  
  const original_values = deposit.toJSON();

  deposit.fee = deposit_management_fee;
  deposit.amount = amount;
  deposit.status = MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Completed;
  deposit.depositor_user_id = user_id;
  deposit.completion_timestamp = new Date();

  [ err, deposit ] = await to(deposit.save());
  if(err) TE(err.message);

  logAction('basic', { name: 'Deposit', action: 'Completed', relations: { recipe_run_deposit_id: deposit.id } });

  return { original_deposit: original_values, updated_deposit: deposit };

};
module.exports.approveDeposit = approveDeposit;