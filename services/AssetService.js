'use strict';

const Asset = require('../models').Asset;
const AssetStatusChange = require('../models').AssetStatusChange;
const AssetMarketCapitalization = require('../models').AssetMarketCapitalization;
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
    `, {
    replacements: {
      type: INSTRUMENT_STATUS_CHANGES.Whitelisting
    },
    model: Asset,
    type: sequelize.QueryTypes.SELECT
  }));

  if (err) TE(err.message);

  return assets;
};
module.exports.getWhitelisted = getWhitelisted;

/**
 * Returns a list of assets (currency data objects) that currently represent the provided strategy type for investment runs
 * Only checks whitelisted coins. Can exclude assets by list of ids.
 * @param strategy_type a value from the STRATEGY_TYPES enumeration described in model_constants.js 
 */
const getStrategyAssets = async function (strategy_type, exclude_from_index = []) {  
  //check for valid strategy type
  if (!Object.values(STRATEGY_TYPES).includes(parseInt(strategy_type, 10))) {
    TE(`Unknown strategy type ${strategy_type}!`);
  }
  
  let exclude_string = exclude_from_index.length ? 
    `AND asset.id NOT IN (${exclude_from_index.join()})` :
    ``;

  // get assets that aren't blacklisted, sorted by marketcap average of 7 days
  let [err, assets] = await to(sequelize.query(`
    SELECT asset.id,
          asset.symbol,
          asset.long_name,
          asset.is_base,
          asset.is_deposit,
          avg(cap.market_share_percentage) AS avg_share,
          ilh.exchange_id,
          ilh.avg_vol,
          i.id,
        i.transaction_asset_id,
          ilh.min_vol,
        (100 / (SUM(avg(cap.market_share_percentage)) OVER ()) * avg(cap.market_share_percentage)) as investment_percentage

    FROM asset
    INNER JOIN instrument AS i ON i.quote_asset_id=asset.id

    LEFT JOIN
      ( SELECT inlh.instrument_id AS instrument_id,
              inlh.exchange_id AS exchange_id,
              avg(inlh.volume) avg_vol,
                                ilr.minimum_volume AS min_vol
      FROM instrument_liquidity_history AS inlh
      INNER JOIN instrument_liquidity_requirement AS ilr ON ilr.instrument_id=inlh.instrument_id
      WHERE inlh.timestamp_to >= NOW() - (ilr.periodicity_in_days * interval '1 day')
      GROUP BY inlh.instrument_id,
                inlh.exchange_id,
                ilr.minimum_volume ) AS ilh ON ilh.instrument_id=i.id
    INNER JOIN
      ( SELECT *
      FROM asset_market_capitalization AS c
      WHERE c.timestamp >= NOW() - interval '7 days' ) AS cap ON cap.asset_id=asset.id
    WHERE (
            (SELECT CASE TYPE WHEN ${INSTRUMENT_STATUS_CHANGES.Whitelisting} THEN TRUE ELSE FALSE END
              FROM asset_status_change
              WHERE asset_id=asset.id
              ORDER BY TIMESTAMP DESC LIMIT 1)
          OR NOT EXISTS
            (SELECT TRUE
              FROM asset_status_change
              WHERE asset_id = asset.id) )
        AND ilh.avg_vol > ilh.min_vol
        ${exclude_string}

    GROUP BY asset.id,
            asset.symbol,
            asset.long_name,
            asset.is_base,
            asset.is_deposit,
            i.id,
            ilh.min_vol,
            ilh.exchange_id,
            ilh.avg_vol
    ORDER BY avg_share DESC LIMIT ${INDEX_CAP_TOTAL}`, {
    type: sequelize.QueryTypes.SELECT
  }));

  if (err) TE(err.message);

  let totalMarketShare = 0;
  let lci = _.remove(assets.slice(0, INDEX_LCI_CAP), function (coin) {
    totalMarketShare += parseFloat(coin.avg_share);
    return totalMarketShare <= LCI_MARKETSHARE_PRC;
  });

  if (strategy_type == STRATEGY_TYPES.LCI) {
    return lci;
  }

  let mci = assets.slice(lci.length, lci.length + INDEX_MCI_CAP);

  return mci;
};
module.exports.getStrategyAssets = getStrategyAssets;