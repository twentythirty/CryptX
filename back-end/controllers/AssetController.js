'use strict';

const assetService = require('../services/AssetService');
const Asset = require('../models').Asset;
const AssetStatusChange = require('../models').AssetStatusChange;
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

  let asset_id = req.params.asset_id;
  let asset = await Asset.findOne({
    where: {
      id: asset_id
  },
    include: [{
      model: AssetStatusChange,
      order: [
        ['timestamp', 'DESC']
      ]
    }]
  });
  if (!asset) return ReE(res, 'Asset not found', 404);

  // mock data below assigned below
  
  let new_asset_data = Object.assign(asset.toJSON(), {
    /* symbol: 999,
    is_cryptocurrency: 999,
    long_name: 999,
    is_base: 999,
    is_deposit: 999, */
    capitalization: 999,
    nvt_ratio: 999,
    market_share: 999,
    capitalization_updated: 999,
    status: INSTRUMENT_STATUS_CHANGES.Whitelisting
  });

  let status_changes = new_asset_data.AssetStatusChanges;
  delete new_asset_data.AssetStatusChanges;
  return ReS(res, {
    assets: new_asset_data,
    status_changes
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

const getAssetsColumnLOV = async (req, res) => {

  const field_name = req.params.field_name
  const { query } = _.isPlainObject(req.body)? req.body : { query: '' };

  const field_vals = await adminViewsService.fetchAssetsViewHeaderLOV(field_name, query);

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

  let asset_id = req.params.asset_id;
  let [err, status] = await to(assetService.changeStatus(asset_id, req.body, req.user.id));

  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    status: status
  })
};
module.exports.changeAssetStatus = changeAssetStatus;
