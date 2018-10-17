'use strict';

const InvestmentService = require('../services/InvestmentService');
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const RecipeRunDetailInvestment = require('../models').RecipeRunDetailInvestment
const Asset = require('../models').Asset;
const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;
const InvestmentAssetConversion = require('../models').InvestmentAssetConversion;
const ColdStorageService = require('./ColdStorageService');
const ColdStorageTransfer = require('../models').ColdStorageTransfer;
const Sequelize = require('../models').Sequelize;
const sequelize = require('../models').sequelize;

const { in: opIn, ne: opNe, or: opOr } = Sequelize.Op;

const { logAction } = require('../utils/ActionLogUtil'); 

const generateRecipeRunDeposits = async function (recipe_run_id) {

  let [ err, recipe_run ] = await to(RecipeRun.findById(recipe_run_id));

  if(err) TE(err.message);
  if(!recipe_run) return null;

  if (recipe_run.approval_status !== RECIPE_RUN_STATUSES.Approved) {
    TE(`Deposit calculation is only allowed for Approved Recipe Runs`);
  }

  let deposit_count;
  [ err, deposit_count ] = await to(RecipeRunDeposit.count({
    where: { recipe_run_id: recipe_run.id }
  }));

  if(err) TE(err.message);
  if(deposit_count) TE(`Recipe Run with id "${recipe_run.id}" already has Deposits`);

  let conversions;
  [ err, conversions ] = await to(InvestmentAssetConversion.findAll({
    where: { recipe_run_id: recipe_run.id }
  }));

  if(err) TE(err.message);

  for(let conversion of conversions) {
    if(conversion.status === ASSET_CONVERSION_STATUSES.Pending) TE(`Cannot calculate deposits while there are Pending asset conversions`);
  }

  //Get unique combinations of quote assets and exchanges.
  let details;
  [ err, details ] = await to(sequelize.query(`
    SELECT
      rrd.quote_asset_id,
      rrd.target_exchange_id,
      SUM(rrd.investment_percentage) AS investment_percentage,
      COALESCE(SUM(rrdi.amount), 0) AS amount
    FROM recipe_run_detail AS rrd
    LEFT JOIN recipe_run_detail_investment AS rrdi ON rrdi.recipe_run_detail_id = rrd.id AND rrdi.asset_id = rrd.quote_asset_id
    LEFT JOIN investment_asset_conversion AS iac ON iac.recipe_run_id = rrd.recipe_run_id AND iac.target_asset_id = rrd.quote_asset_id
    WHERE rrd.recipe_run_id=:recipe_run_id
    GROUP BY rrd.quote_asset_id, rrd.target_exchange_id, iac.amount
  `, {
    replacements: { 
      recipe_run_id: recipe_run.id
    },
    type: sequelize.QueryTypes.SELECT
  }));
  
  if(err) TE(err.message);

  //Calculate sum of base assets after the conversion
  const investment_totals = {};
  for(let detail of details) {
    if(!investment_totals[detail.quote_asset_id]) investment_totals[detail.quote_asset_id] = { amount: Decimal(0), percentage: Decimal(0) };

    investment_totals[detail.quote_asset_id].amount = investment_totals[detail.quote_asset_id].amount.plus(detail.amount);
    investment_totals[detail.quote_asset_id].percentage = investment_totals[detail.quote_asset_id].percentage.plus(detail.investment_percentage);
  }

  const exchange_ids = details.map(d => d.target_exchange_id)
    .filter(id => id !== null); // no need to search for exchanges by null
  let exchange_accounts = [];
  [ err, exchange_accounts ] = await to(ExchangeAccount.findAll({
    where: { 
      exchange_id: { [opIn]: exchange_ids }
    }
  }));

  if(err) TE(err.message);

  //Find exchange account for each detail and create return a deposit for each one.
  let base_assets;
  [base_assets, details] = _.partition(details, d => !d.target_exchange_id);

  let missing_acounts = [];
  let deposits = details.map(detail => {
    const account = exchange_accounts.find(ex_account => detail.target_exchange_id === ex_account.exchange_id && detail.quote_asset_id === ex_account.asset_id);
    if(account) {
      let quote_totals = investment_totals[detail.quote_asset_id];
      let amount = Decimal(quote_totals.amount);

      const conversion = conversions.find(c => c.target_asset_id === detail.quote_asset_id);

      if(quote_totals && conversion) amount = amount.plus(conversion.amount);

      amount = amount.mul(detail.investment_percentage).div(quote_totals.percentage);

      return {
        asset_id: account.asset_id,
        creation_timestamp: new Date(),
        recipe_run_id: recipe_run.id,
        target_exchange_account_id: account.id,
        status: MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending,
        amount: amount.toString()
      };
    }
    else missing_acounts.push({
      exchange_id: detail.target_exchange_id,
      quote_asset_id: detail.quote_asset_id
    });
    
  }).filter(deposit => deposit);

  let investment_run;
  [err, investment_run] = await to(InvestmentService.findInvestmentRunFromAssociations({
    recipe_run_id: recipe_run.id
  }));
  if (err) TE(err.message);

  let direct_to_cold_storage = await Promise.all(base_assets.map(async (base_asset) => {
    
    let [err, cold_storage_account] = await to(
      ColdStorageService.findColdStorageAccount(
        investment_run.strategy_type, base_asset.quote_asset_id
      )
    );

    if (err) TE(err.message);
    if (!cold_storage_account) TE(`No cold storage account found`);
    
    let quote_totals = investment_totals[base_asset.quote_asset_id];
    let amount = Decimal(quote_totals.amount);

    const conversion = conversions.find(c => c.target_asset_id === base_asset.quote_asset_id);
    if(quote_totals && conversion) amount = amount.plus(conversion.amount);
    amount = amount.mul(base_asset.investment_percentage).div(quote_totals.percentage);

    return {
      asset_id: base_asset.quote_asset_id,
      creation_timestamp: new Date(),
      recipe_run_id: recipe_run.id,
      cold_storage_account_id: cold_storage_account.id,
      status: MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending,
      amount: amount.toString()
    };
  }));

  deposits.push(...direct_to_cold_storage);

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

  [ err, deposits ] = await to(RecipeRunDeposit.bulkCreate(deposits, { returning: true }));
  
  if(err) TE(err.message);

  await logAction('deposits.generate', { 
    args: {
      amount: deposits.length,
      recipe_id: recipe_run.id
    },
    relations: { recipe_run_id: recipe_run.id }
  });

  return deposits;

}
module.exports.generateRecipeRunDeposits = generateRecipeRunDeposits;

const submitDeposit = async (deposit_id, user, updated_values = {}) => {
  const { deposit_management_fee, amount } = updated_values;

  if(_.isEmpty(updated_values)){
    TE('Must provied at least the amount or deposit management fee.');
  }

  if((deposit_management_fee != null) && (!_.isNumber(deposit_management_fee) || deposit_management_fee < 0)) {
    TE('Deposit managmenent fee must be a positive number');
  }

  if((amount != null) && (!_.isNumber(amount) || amount < 0)) {
    TE('Deposit amount must be a positive number');
  }

  let [ err, deposit ] = await to(RecipeRunDeposit.findById(deposit_id));
  if(err) TE(err.message);
  if(!deposit) return null;
  if (deposit.status !== MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending) TE(`Deposit submitting is only allowed for Pending deposits.`);

  const original_values = deposit.toJSON();

  deposit.fee = deposit_management_fee == null? deposit.fee : deposit_management_fee;
  deposit.amount = amount == null? deposit.amount : amount;

  let cold_storage;
  [ err, cold_storage ] = await to(sequelize.transaction(transaction => {
    return deposit.save({ transaction }).then(result => {
      deposit = result;
      if (deposit.cold_storage_account_id == null) { // not direct transfer to cold storage
        return Promise.resolve(result);
      };

      return ColdStorageTransfer.create({ // create completed transfer
        recipe_run_id: deposit.recipe_run_id,
        status: COLD_STORAGE_ORDER_STATUSES.Completed,
        placed_timestamp: new Date(),
        completed_timestamp: new Date(),
        fee: 0, // fee is 0 because its save on deposit.
        ..._.pick(deposit, [ 'cold_storage_account_id', 'asset_id', 'amount'])
      }, { transaction });
    })
  }));

  if(err) TE(err.message);

  await user.logAction('modified', { 
    previous_instance: original_values, 
    updated_instance: deposit,
    ignore: ['completion_timestamp'],
    replace: { status: { 
      [RECIPE_RUN_DEPOSIT_STATUSES.Pending]: `{deposits.status.${RECIPE_RUN_DEPOSIT_STATUSES.Pending}}`, 
      [RECIPE_RUN_DEPOSIT_STATUSES.Completed]: `{deposits.status.${RECIPE_RUN_DEPOSIT_STATUSES.Completed}}`,
    } }
  });

  return { original_deposit: original_values, updated_deposit: deposit };
};
module.exports.submitDeposit = submitDeposit;

const approveDeposit = async (deposit_id, user_id) => {

  let [err, deposit] = await to(RecipeRunDeposit.findById(deposit_id));

  if (err) TE(err.message);
  if (!deposit) return null;
  if (deposit.status !== MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending) TE(`Deposit confirmation is only allowed for Pending deposits.`);
  const decimal0 = Decimal(0);
  //check amount
  const amount_decimal = Decimal(deposit.amount || '0')
  if (amount_decimal.lte(decimal0)) TE(`Can't confirm deposit ${deposit_id} with bad amount ${deposit.amount}`);
  const fee_decimal = Decimal(deposit.fee || '-1')
  if (fee_decimal.lt(decimal0)) TE(`Can't confirm deposit ${deposit_id} with bad fee ${deposit.fee}`);

  const original_values = deposit.toJSON();

  deposit.status = MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Completed;
  deposit.depositor_user_id = user_id;
  deposit.completion_timestamp = new Date();

  [ err, deposit ] = await to(deposit.save());
  if(err) TE(err.message);

  await logAction('deposits.completed', { relations: { recipe_run_deposit_id: deposit.id } });

  let left_deposits;
  [err, left_deposits] = await to(RecipeRunDeposit.findAll({
    where: {
      recipe_run_id: deposit.recipe_run_id,
      status: {
        [opNe]: RECIPE_RUN_DEPOSIT_STATUSES.Completed
      }
    }
  }));
  if (err) TE(err.message);

  if (!left_deposits.length) { // all deposits completed. Change investment run status to deposits completed
    let investment_run;
    [err, investment_run] = await to(InvestmentService.changeInvestmentRunStatus(
      { recipe_deposit_id: deposit_id }, INVESTMENT_RUN_STATUSES.DepositsCompleted
    ));
    if (err) TE(err.message);
  }

  return { original_deposit: original_values, updated_deposit: deposit };

};
module.exports.approveDeposit = approveDeposit;

const generateAssetConversions = async recipe_run => {

  const [ err, result ] = await to(Promise.all([
    RecipeRunDetail.findAll({
      where: { recipe_run_id: recipe_run.id },
      include: RecipeRunDetailInvestment
    }),
    Asset.findAll({
      where: {
        [opOr]: [
          { is_deposit: true }, { is_base: true }
        ]
      }
    })
  ]));

  const [ details, assets ] = result; 

  if(err) TE(err.message);
  if(!details.length) TE(`Could not locate recipe run details for recipe run with id "${recipe_run.id}"`);

  const investment_assets = assets.filter(asset => asset.is_deposit && !asset.is_base);
  const base_assets = assets.filter(asset => asset.is_base);

  const conversions = [];
  for(let investment_asset of investment_assets) {
    for(let base_asset of base_assets) {

      const total_amount = details.filter(detail => detail.quote_asset_id === base_asset.id).reduce((total, detail) => {

        const investment = detail.RecipeRunDetailInvestments.find(inv => inv.asset_id === investment_asset.id);
        if(investment) total = total.plus(investment.amount);

        return total;

      }, Decimal(0));

      if(total_amount.gt(0)) conversions.push({
        recipe_run_id: recipe_run.id,
        investment_asset_id: investment_asset.id,
        target_asset_id: base_asset.id
      });

    }
  }

  return conversions;

};
module.exports.generateAssetConversions = generateAssetConversions;

const submitAssetConversion = async (conversion_id, amount, user, complete = false) => {

  if((complete && amount) || !complete) {
    if(!_.isNumber(amount) || amount <= 0) TE(`Converted amount must a positive number`);
  }
  
  let [ err, conversion ] = await to(InvestmentAssetConversion.findById(conversion_id));

  if(err) TE(err.message);
  if(!conversion) return null;

  if(conversion.status === ASSET_CONVERSION_STATUSES.Completed) {
    TE(`Conversion with id "${conversion_id}" is already Completed`);
  }

  if(amount) conversion.amount = amount;

  if(!conversion.amount) TE('Amount must be set before completing a Conversion');

  if(complete) {
    conversion.completed_timestamp = new Date();
    conversion.depositor_user_id = user.id;
    conversion.status = ASSET_CONVERSION_STATUSES.Completed;
  }

  /*
  const log_options = {
    previous_instance: Object.assign({}, conversion._previousDataValues),
    updated_instance: conversion,
    ignore: ['completed_timestamp', 'depositor_user_id'],
    replace: {
      status: {
        [ASSET_CONVERSION_STATUSES.Pending]: `{asset_conversions.status.${ASSET_CONVERSION_STATUSES.Pending}}`,
        [ASSET_CONVERSION_STATUSES.Completed]: `{asset_conversions.status.${ASSET_CONVERSION_STATUSES.Completed}}`
      }
    },
    relations: { recipe_run_id: conversion.recipe_run_id }
  };
  */

  [ err, conversion ] = await to(conversion.save());

  if(err) TE(err.message);

  /*
  if(user) await user.logAction('modified', log_options);
  else await logAction('modified', log_options);
  */

  return conversion;

};
module.exports.submitAssetConversion = submitAssetConversion;