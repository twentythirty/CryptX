'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const Asset = require('../models').Asset;
const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;
const Sequelize = require('../models').Sequelize;

const { in: opIn } = Sequelize.Op;

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
    || approved_recipe_run.approval_status == null
    || approved_recipe_run.approval_status !== RECIPE_RUN_STATUSES.Approved) {

    TE(`Bad input! submitted input must be a recipe run object with status ${RECIPE_RUN_STATUSES.Approved} (Approved)! GOt: ${approved_recipe_run}`)
  }

  //Get unique combinations of quote assets and exchanges.
  let [ err, details ] = await to(RecipeRunDetail.findAll({
    where: { recipe_run_id: approved_recipe_run.id },
    attributes: ['quote_asset_id', 'target_exchange_id', Sequelize.fn('sum', Sequelize.col('investment_percentage'))],
    group: ['quote_asset_id', 'target_exchange_id']
  }));
  
  if(err) TE(err.message);

  const exchange_ids = details.map(d => d.target_exchange_id);
  let exchange_accounts = [];
  [ err, exchange_accounts ] = await to(ExchangeAccount.findAll({
    where: { 
      exchange_id: { [opIn]: exchange_ids }
    }
  }));

  if(err) TE(err.message);

  //Find exchange account for each detail and create return a deposit for each one.
  let missing_acounts = [];
  let deposits = details.map(detail => {
    const account = exchange_accounts.find(ex_account => detail.target_exchange_id === ex_account.exchange_id && detail.quote_asset_id === ex_account.asset_id);
    if(account) return {
      asset_id: account.asset_id,
      creation_timestamp: new Date(),
      recipe_run_id: approved_recipe_run.id,
      target_exchange_account_id: account.id,
      status: MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending
    };
    else missing_acounts.push({
      exchange_id: detail.target_exchange_id,
      quote_asset_id: detail.quote_asset_id
    });
    
  }).filter(deposit => deposit);

  //If there are missing accounts, reject. Also attempt to fetch exchanges and assets to be more informative.
  if(missing_acounts.length) {
    let [ err, result ] = await to(Promise.all([
      Exchange.findAll({ where: { id: { [opIn]: missing_acounts.map(m => m.exchange_id) } } }),
      Asset.findAll({ where: { id: { [opIn]: missing_acounts.map(m => m.quote_asset_id) } } })
    ]));

    if(err) TE(err.message);

    const [ missing_exchanges, missing_assets ] = result;

    const missing_pairs = missing_acounts.map(ma => {
      const exchange = missing_exchanges.find(me => me.id == ma.exchange_id);
      const asset = missing_assets.find(am => am.id === ma.quote_asset_id);
      return `${exchange.name}/${asset.symbol}`; 
    });

    TE(`Could not generate deposits, because deposit accounts are missing for Exchange/Asset pairs: ${missing_pairs.join(', ')}`);
  }

  //console.log(deposits)
  [ err, deposits ] = await to(RecipeRunDeposit.bulkCreate(deposits));
  
  if(err) TE(err.message);

  logAction('deposits.generate', { 
    amount: deposits.length,
    relations: { recipe_run_id: approved_recipe_run.id }
  });

  return deposits;

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