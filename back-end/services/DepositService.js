'use strict';

const InvestmentRun = require('../models').InvestmentRun;
const InvestmentRunDeposit = require('../models').InvestmentRunDeposit;
const Asset = require('../models').Asset;

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