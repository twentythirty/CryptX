'use strict';

const assetService = require('../services/AssetService');
const Asset = require('../models').Asset;
const Op = require('sequelize').Op;
const adminViewsService = require('../services/AdminViewsService');

const getAsset = async function (req, res) {

  let asset_id = req.params.asset_id;
  let [err, asset] = await to(Asset.findOne({
    where: {
      id: asset_id
    }
  }));
  if (err) return ReE(res, err.message, 422);
  if (!asset) return ReE(res, 'Asset not found', 422);
  
  return ReS(res, {
    asset: asset
  })
};
module.exports.getAsset = getAsset;

const getAssets = async function (req, res) {

  console.log('WHERE clause: %o', req.seq_query);

  let [err, result] = await to(Asset.findAndCountAll(req.seq_query));
  if (err) return ReE(res, err.message, 422);

  let { rows: assets, count } = result;
  return ReS(res, {
    assets: assets,
    count
  })
};
module.exports.getAssets = getAssets;

const getAssetDetailed = async function (req, res) {

  const asset_id = req.params.asset_id;
  
  const single_asset_view = await adminViewsService.fetchAssetView(asset_id);
  if (single_asset_view == null) {
    return ReE(res, `Asset information for id ${asset_id} not found!`, 404);
  }

  const asset_history = await assetService.fetchAssetStatusHistory(single_asset_view);
  
  const formatted_history = _.map(asset_history, history_element => {

    return {
      asset_id: history_element.asset_id,
      timestamp: history_element.timestamp,
      user: {
        id: history_element.User ? history_element.User.id : null,
        name: history_element.User ? history_element.User.fullName() : 'System',
        email: history_element.User ? history_element.User.email : 'System'
      },
      comment: history_element.comment,
      type: `assets.status.${history_element.type}`
    }
  })

  return ReS(res, {
    asset: single_asset_view,
    history: formatted_history
  })
};
module.exports.getAssetDetailed = getAssetDetailed;

const getAssetsDetailed = async function (req, res) {

  console.log('WHERE clause: %o', req.seq_query);

  let [error, assets_with_count] = await to(adminViewsService.fetchAssetsViewDataWithCount(req.seq_query));
  if (error)
    return ReE(res, error, 422);

  let footer;
  [error, footer] = await to(adminViewsService.fetchAssetsViewFooter(req.sql_where));
  if (error) 
    return ReE(res, error, 422);
  
  const { data: assets, total: count } = assets_with_count;

  return ReS(res, {
    assets,
    count,
    footer
  })
};
module.exports.getAssetsDetailed = getAssetsDetailed;

const getAssetsDetailedOfInvestmentRunAssetGroup = async (req, res) => {

  let { sql_where, seq_query } = req;

  const { investment_asset_group_id } = req.params;

  if(!seq_query.where) seq_query.where = {};
  seq_query.where.investment_run_asset_group_id = investment_asset_group_id;

  if(sql_where !== '') sql_where += 'AND ';
  sql_where += `investment_run_asset_group_id = ${investment_asset_group_id}`;
  console.log(sql_where);
  const [ err, result ] = await to(Promise.all([
    adminViewsService.fetchGroupAssetsViewDataWithCount(seq_query),
    adminViewsService.fetchGroupAssetViewFooter(sql_where)
  ]));

  if(err) return ReE(res, err.message, 422);

  const [ data_with_count, footer ] = result;
  const { data: assets, total: count } = data_with_count;

  return ReS(res, {
    assets,
    count,
    footer
  })

};
module.exports.getAssetsDetailedOfInvestmentRunAssetGroup = getAssetsDetailedOfInvestmentRunAssetGroup;

const getAssetsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name
  const { query } = _.isPlainObject(req.body)? req.body : { query: '' };

  const field_vals = await adminViewsService.fetchAssetsViewHeaderLOV(field_name, query, req.sql_where);

  return ReS(res, {
    query: query,
    lov: field_vals
  })
};
module.exports.getAssetsColumnLOV = getAssetsColumnLOV;

const getWhitelisted = async function (req, res) {
  
  let assets = await assetService.getWhitelisted();
  
  if (!assets) return ReE(res, 'No assets not found', 404);

  return ReS(res, { assets });
};
module.exports.getWhitelisted = getWhitelisted;

const changeAssetStatus = async function (req, res) {

  const { asset_id } = req.params;
  const { user } = req; //User will be passed for easier determination if thisshould be logged as user or system.

  let [err, status] = await to(assetService.changeStatus(asset_id, req.body, user));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    status: status
  })
};
module.exports.changeAssetStatus = changeAssetStatus;

const getExchangeAssets = async function(req, res) {

  const { exchange_id } = req.params;

  const [ err, assets ] = await to(assetService.getExchangeMappedAssets(exchange_id));

  if(err) return ReE(res, err.message, 422);
  if(!assets) return ReE(res, `Exchange with id ${exchange_id} was not found`, 404);

  return ReS(res, { assets, count: assets.length });

}
module.exports.getExchangeAssets = getExchangeAssets;