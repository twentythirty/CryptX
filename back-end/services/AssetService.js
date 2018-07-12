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
          avg(cap.market_share_percentage) AS avg_share

    FROM asset
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
        ${exclude_string}

    GROUP BY asset.id,
            asset.symbol,
            asset.long_name,
            asset.is_base,
            asset.is_deposit
    ORDER BY avg_share DESC LIMIT ${SYSTEM_SETTINGS.INDEX_LCI_CAP + SYSTEM_SETTINGS.INDEX_MCI_CAP}`, {
    type: sequelize.QueryTypes.SELECT
  }));

  if (err) TE(err.message);

  assets.map(a => {
    Object.assign(a, {
      avg_share: parseFloat(a.avg_share),
    });
  });

  let totalMarketShare = 0;
  // selects all assets before threshold MARKETCAP_LIMIT_PERCENT, total marketshare sum of assets
  let before_marketshare_limit = assets.reduce((acc, coin, currentIndex) => {
    totalMarketShare += coin.avg_share;
    if(totalMarketShare <= SYSTEM_SETTINGS.MARKETCAP_LIMIT_PERCENT)
      acc.push(coin);
    return acc;
  }, []);

  let lci = before_marketshare_limit.slice(0, SYSTEM_SETTINGS.INDEX_LCI_CAP);

  if (strategy_type == STRATEGY_TYPES.LCI) {
    return lci;
  }

  let mci = assets.slice(lci.length, lci.length + SYSTEM_SETTINGS.INDEX_MCI_CAP);

  return mci;
};
module.exports.getStrategyAssets = getStrategyAssets;


/** Finds all possible ways to acquire asset. Returns all instruments and exchanges,
 * with volume and lastest ask&bid prices.
 * @param asset_id id of asset to find instruments for
 */
const getAssetInstruments = async function (asset_id) {
  let err, instruments;
  [err, instruments] = await to(sequelize.query(`
    SELECT i.id as instrument_id,
      i.transaction_asset_id,
      i.quote_asset_id,
      imp.exchange_id,
      ilh.avg_vol as average_volume,
      ilh.min_vol as min_volume_requirement,
      imd.ask_price,
      imd.bid_price
    FROM instrument as i
    -- only leave instruments satisfying liquidity requirements
    JOIN instrument_exchange_mapping AS imp ON imp.instrument_id=i.id
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
    -- add newest ask and bid price
    JOIN instrument_market_data as imd ON imd.id=(
      SELECT id
      FROM instrument_market_data as imdd
      WHERE imdd.instrument_id=i.id
      AND imdd.exchange_id=imp.exchange_id
      ORDER BY timestamp DESC LIMIT 1)
    WHERE i.transaction_asset_id=${asset_id} OR i.quote_asset_id=${asset_id}
    `, {
      type: sequelize.QueryTypes.SELECT
    })
  );

  if (err) TE(err.message);

  instruments.map(i => {
    Object.assign(i, {
      average_volume: parseFloat(i.average_volume),
      min_volume_requirement: parseFloat(i.min_volume_requirement),
      ask_price: parseFloat(i.ask_price),
      bid_price: parseFloat(i.bid_price)
    });
  });

  return instruments;
};
module.exports.getAssetInstruments = getAssetInstruments;

const getBaseAssetPrices = async function () {
  let [err, prices] = await to(sequelize.query(`
  SELECT prices.symbol as symbol, AVG(prices.price) as price
  FROM
  (
    SELECT assetBuy.symbol as symbol, imd1.ask_price as price, imd1.timestamp as timestamp
    FROM asset as a1
    JOIN instrument i ON i.transaction_asset_id=a1.id
    JOIN asset as assetBuy ON assetBuy.id=i.quote_asset_id
    JOIN instrument_exchange_mapping as iem1 ON iem1.instrument_id=i.id
    JOIN instrument_market_data imd1 ON imd1.id=(
        SELECT id FROM instrument_market_data imdd 
        WHERE imdd.instrument_id=i.id
          AND imdd.exchange_id=iem1.exchange_id
        ORDER BY timestamp DESC
        LIMIT 1
      )
    WHERE a1.symbol='USD'
      AND assetBuy.is_base=true
    GROUP BY assetBuy.symbol, imd1.ask_price, imd1.timestamp
    
    UNION 
    
    SELECT assetSell.symbol as symbol, (1 / imd2.bid_price) as price, imd2.timestamp as timestamp
    FROM asset as a2
    JOIN instrument i ON i.quote_asset_id=a2.id
    JOIN asset as assetSell ON assetSell.id=i.transaction_asset_id
    JOIN instrument_exchange_mapping as iem2 ON iem2.instrument_id=i.id
    JOIN instrument_market_data imd2 ON imd2.id=(
        SELECT id FROM instrument_market_data imdd 
        WHERE imdd.instrument_id=i.id
          AND imdd.exchange_id=iem2.exchange_id
        ORDER BY timestamp DESC
        LIMIT 1
      )
    WHERE a2.symbol='USD'
    AND assetSell.is_base=true
    GROUP BY assetSell.symbol, imd2.bid_price, imd2.timestamp
  ) as prices
  WHERE prices.timestamp >= NOW() - interval '15 minutes'
  GROUP BY prices.symbol
  `, {
    type: sequelize.QueryTypes.SELECT
  }));

  if (err) TE(err.message);

  if (!prices.length) TE('No base asset prices in USD for past 15 minutes found!');

  prices.map(p => {
    Object.assign(p, {
      price: parseFloat(p.price),
    });
  });

  return prices;
}
module.exports.getBaseAssetPrices = getBaseAssetPrices;