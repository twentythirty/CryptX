'use strict';

const Asset = require('../models').Asset;
const AssetStatusChange = require('../models').AssetStatusChange;
const User = require('../models').User;
const sequelize = require('../models').sequelize;

const changeStatus = async function (asset_id, new_status, user_id) {
  
  if (!_.valuesIn(INSTRUMENT_STATUS_CHANGES).includes(new_status.type))
    TE("Provided bad asset status");

  let [err, asset] = await to(Asset.findById(asset_id));
  if (!asset) TE("Asset not found");
  let user = await User.findById(user_id);

  let status = new AssetStatusChange({
    timestamp: new Date(),
    comment: new_status.comment,
    type: new_status.type
  });

  status.setAsset(asset);
  if (user) status.setUser(user);

  [err, status] = await to(status.save());
  if (err) TE(err.message);

  return status;
};
module.exports.changeStatus = changeStatus;

const getWhitelisted = async function () {
  // This query finds assets that are whitelisted(last status type is equal to whitelisted) or don't have any status yet.
  let [err, assets] = await to(sequelize.query(`
    SELECT *
    FROM asset
    WHERE
      (SELECT 
        CASE type WHEN :type THEN true ELSE false END
        FROM asset_status_change
        WHERE asset_id=asset.id
        ORDER BY timestamp DESC
        LIMIT 1)
      OR
      NOT EXISTS (SELECT true FROM asset_status_change WHERE asset_id = asset.id)
    `,
    {
      replacements: {
        type: INSTRUMENT_STATUS_CHANGES.Whitelisting
      },
      model: Asset,
      type: sequelize.QueryTypes.SELECT
    }
  ));

  if (err) TE(err.message);

  return assets;
};
module.exports.getWhitelisted = getWhitelisted;