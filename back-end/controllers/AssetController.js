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

  let [err, assets] = await to(Asset.findAll(req.seq_query));
  if (err) return ReE(res, err.message, 422);

  return ReS(res, {
    assets: assets
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
  let header_lov = fetchMockHeaderLOV;
  return ReS(res, {
    assets: new_asset_data,
    status_changes,
    header_lov
  })
};
module.exports.getAssetDetailed = getAssetDetailed;

const getAssetsDetailed = async function (req, res) {

  console.log('WHERE clause: %o', req.seq_query);

  let [err, assets] = await to(Asset.findAll(req.seq_query));
  if (err) return ReE(res, err.message, 422);

  // mock data below assigned below
  [err, assets] = await to(Asset.findAll(Object.assign({ raw: true}, req.seq_query)));
  if (err) return ReE(res, err.message, 422);

  let new_asset_data = assets;
  
  new_asset_data.map((single_asset_data, index) => {
    return Object.assign(single_asset_data,
      {
      /* symbol: 999,
      is_cryptocurrency: 999,
      long_name: 999,
      is_base: 999,
      is_deposit: 999, */
      capitalization: 999,
      nvt_ratio: 999,
      market_share: 999,
      capitalization_updated: 999,
      status: (index % 2 == 0 ? INSTRUMENT_STATUS_CHANGES.Whitelisting : INSTRUMENT_STATUS_CHANGES.Blacklisting)
      }, single_asset_data)
  });
console.log(new_asset_data);
  let footer;
  [err, footer] = await to(adminViewsService.fetchAssetsViewFooter());

  return ReS(res, {
    assets: new_asset_data,
    footer
  })
};
module.exports.getAssetsDetailed = getAssetsDetailed;

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
