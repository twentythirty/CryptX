'use strict';

const assetService = require('../services/AssetService');
const Asset = require('../models').Asset;
const AssetStatusChange = require('../models').AssetStatusChange;
const Op = require('sequelize').Op;

const getAsset = async function (req, res) {

  let asset_id = req.params.asset_id;
  let asset = await Asset.findOne({
    where: {
      id: asset_id
    },
    include: [{
      model: AssetStatusChange,
      order: [
        ['timestamp', 'DESC']
      ],
      limit: 1
    }]
  });
  if (!asset) return ReE(res, 'Asset not found', 404);

  return ReS(res, {
    asset: asset
  })
};
module.exports.getAsset = getAsset;

const getAssets = async function (req, res) {

  console.log('WHERE clause: %o', req.seq_query);

  let asset = await Asset.findAll(req.seq_query);
  if (!asset) return ReE(res, 'Asset not found', 404);

  return ReS(res, {
    assets: asset
  })
};
module.exports.getAssets = getAssets;


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