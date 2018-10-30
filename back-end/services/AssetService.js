'use strict';

const Asset = require('../models').Asset;
const AssetStatusChange = require('../models').AssetStatusChange;
const AssetMarketCapitalization = require('../models').AssetMarketCapitalization;
const GroupAsset = require('../models').GroupAsset;
const InvestmentRunAssetGroup = require('../models').InvestmentRunAssetGroup;
const Exchange = require('../models').Exchange;
const InstrumentExchangeMapping = require('../models').InstrumentExchangeMapping;
const User = require('../models').User;
const sequelize = require('../models').sequelize;
const Op = require('../models').Sequelize.Op;

const { logAction } = require('../utils/ActionLogUtil');

const changeStatus = async function (asset_id, new_status, user) {

  if (!_.valuesIn(INSTRUMENT_STATUS_CHANGES).includes(new_status.type))
    TE("Provided bad asset status");

  if(!_.isString(new_status.comment) || /^\s*$/.test(new_status.comment)) TE(`Must provide a valid comment/reason`);
  new_status.comment = new_status.comment.trim(); //Might as well as trim the comment;

  let [err, asset] = await to(Asset.findById(asset_id));
  if(err) TE(err.message);
  if (!asset) TE("Asset not found");

  let current_status = null;
  [ err, current_status ] = await to(AssetStatusChange.findOne({
    where: { asset_id },
    order: [[ 'timestamp', 'DESC' ]]
  }));

  //Don't allow same status as the current one.
  if(!current_status) current_status = { type: INSTRUMENT_STATUS_CHANGES.Whitelisting }
  if(current_status.type === new_status.type) TE(`Cannot set the same status as the current status of the asset ${asset.symbol}`);
  

  let status = null;

  [err, status] = await to(AssetStatusChange.create({
    timestamp: new Date(),
    comment: new_status.comment,
    type: new_status.type,
    asset_id: asset.id,
    user_id: user ? user.id : null
  }));

  if (err) TE(err.message);

  //Log only after the changes were made. If user was not provided, log as System.
  const log_options = {
    args: {
      prev_status: `{assets.status.${current_status.type}}`,
      new_status: `{assets.status.${status.type}}`,
      reason: status.comment,
    },
    relations: { asset_id }
  }
  if(user) {
    await user.logAction('assets.status', log_options);
  }
  else {
    await logAction('assets.status', log_options);
  }

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
const getStrategyAssets = async function (strategy_type) {  
  //check for valid strategy type
  if (!Object.values(STRATEGY_TYPES).includes(parseInt(strategy_type, 10))) {
    TE(`Unknown strategy type ${strategy_type}!`);
  }

  // get assets that aren't blacklisted, sorted by marketcap average of 7 days
  let err, assets, excluded = [],
    included = [],
    iteration = 1,
    per_iteration = 50,
    lci_skipped = false,
    total_market_share = 0,
    amount_needed = strategy_type == STRATEGY_TYPES.LCI ?
      SYSTEM_SETTINGS.INDEX_LCI_CAP :
      SYSTEM_SETTINGS.INDEX_MCI_CAP;

  asset_selection:
  do {
    [err, assets] = await to(sequelize.query(`
    SELECT asset.id,
      asset.symbol,
      asset.long_name,
      asset.is_base,
      asset.is_deposit,
      cap.capitalization_usd,
      cap.market_share_percentage AS avg_share,
        CASE WHEN status.type IS NULL THEN :whitelisted ELSE status.type END as status
    FROM asset
    JOIN LATERAL
    (
      SELECT *
      FROM asset_market_capitalization AS c
      WHERE c.asset_id=asset.id
          AND c.timestamp >= NOW() - interval '1 day'
      ORDER BY c.asset_id NULLS LAST, c.timestamp DESC NULLS LAST
      LIMIT 1
    ) AS cap ON cap.asset_id=asset.id
    LEFT JOIN LATERAL (
      SELECT type
      FROM asset_status_change
      WHERE asset_id=asset.id
        ORDER BY TIMESTAMP DESC
      LIMIT 1
    ) as status ON TRUE
    ORDER BY cap.capitalization_usd DESC
      
      LIMIT :limit_count OFFSET :offset_count`, {
      replacements: { 
        limit_count: per_iteration,
        offset_count: (iteration - 1) * per_iteration,
        whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting
      },
    type: sequelize.QueryTypes.SELECT
  }));
    if (err) TE(err.message);
           
    assets.map(a => {
      Object.assign(a, {
        capitalization_usd: parseFloat(a.capitalization_usd),
        avg_share: parseFloat(a.avg_share)
      });
    });

    for (let asset of assets) {

      // if we reached LCI amount and we didn't skip LCI assets yet
      if (( total_market_share + asset.avg_share > SYSTEM_SETTINGS.MARKETCAP_LIMIT_PERCENT ||
        included.length == SYSTEM_SETTINGS.INDEX_LCI_CAP ) &&
        !lci_skipped) {

        // if it's not LCI strategy, the skip LCI assets.
        if ( strategy_type != STRATEGY_TYPES.LCI ) {
          included = [];
          excluded = [];
          lci_skipped = true;
        } else // exit asset selection if it is LCI strategy
          break asset_selection;

      } else if (included.length == amount_needed) { // reached needed amount, exit asset selection
        break asset_selection;
      }
     
      if (asset.status == INSTRUMENT_STATUS_CHANGES.Whitelisting) { // include if whitelisted
        included.push(asset);
        total_market_share += asset.avg_share;
      } else // exclude all not whitelisted
        excluded.push(asset);      
    }

    iteration++; // increment this to calculate offset
  } while (assets.length && included.length < amount_needed); // while fetching assets returns some, and we don't have needed amount yet

  if (!included.length)
    TE(`No assets found for ${_.invert(STRATEGY_TYPES)[strategy_type]} portfolio`);

  if (process.env.MAX_MCI_MIX_SIZE && strategy_type === STRATEGY_TYPES.MCI) {
    included = included.slice(0, parseInt(process.env.MAX_MCI_MIX_SIZE));
  }

  return [included, excluded];
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
    imd.ask_price,
    imd.bid_price
  FROM instrument as i
  JOIN instrument_exchange_mapping AS imp ON imp.instrument_id=i.id

  JOIN instrument_market_data as imd ON imd.id=(
    SELECT id
    FROM instrument_market_data as imdd
    WHERE imdd.instrument_id=i.id
    AND imdd.exchange_id=imp.exchange_id
    ORDER BY timestamp DESC LIMIT 1
  )
  WHERE i.transaction_asset_id=${asset_id} OR i.quote_asset_id=${asset_id}
    `, {
      type: sequelize.QueryTypes.SELECT
    })
  );

  if (err) TE(err.message);

  instruments.map(i => {
    Object.assign(i, {
      
      ask_price: parseFloat(i.ask_price),
      bid_price: parseFloat(i.bid_price)
    });
  });

  return instruments;
};
module.exports.getAssetInstruments = getAssetInstruments;

const getInstrumentLiquidityRequirements = async function (instrument_id, exchange_id) {
   let [err, requirements] = await to(sequelize.query(
    `SELECT AVG(ilh.volume) as avg_vol,
    iem.instrument_id,
    iem.exchange_id,
    ilr.minimum_volume,
    ilr.periodicity_in_days
  FROM instrument AS i
  JOIN instrument_exchange_mapping AS iem ON iem.instrument_id=i.id
  JOIN instrument_liquidity_requirement AS ilr ON ilr.instrument_id=iem.instrument_id AND
    (ilr.exchange=iem.exchange_id OR ilr.exchange IS NULL)
  LEFT JOIN instrument_liquidity_history AS ilh ON (
    ilh.instrument_id=iem.instrument_id
    AND 
    ilh.exchange_id=iem.exchange_id
    AND
    timestamp_to > NOW() - ilr.periodicity_in_days * interval '1 days'
  )
  WHERE iem.instrument_id=:instrument_id AND iem.exchange_id=:exchange_id
  GROUP BY iem.instrument_id, iem.exchange_id, ilr.minimum_volume, ilr.periodicity_in_days`,
  {
    replacements: {
      instrument_id,
      exchange_id
    },
    type: sequelize.QueryTypes.SELECT
  }));
  
  if (err) TE(err.message);

  requirements.map(r => {
    Object.assign(r, {
      minimum_volume: parseFloat(r.minimum_volume),
      avg_vol: parseFloat(r.avg_vol)
    });
  });

  return requirements;
};
module.exports.getInstrumentLiquidityRequirements = getInstrumentLiquidityRequirements;

const getBaseAssetPrices = async function () {
  const ttl_threshold = SYSTEM_SETTINGS.BASE_ASSET_PRICE_TTL_THRESHOLD;
  
  let [err, prices] = await to(sequelize.query(`
  SELECT id, prices.symbol as symbol, AVG(prices.price) as price
  FROM
  (
    SELECT assetBuy.id, assetBuy.symbol as symbol, imd1.ask_price as price, imd1.timestamp as timestamp
    FROM asset as a1
    JOIN instrument i ON i.quote_asset_id=a1.id
    JOIN asset as assetBuy ON assetBuy.id=i.transaction_asset_id
    JOIN instrument_exchange_mapping as iem1 ON iem1.instrument_id=i.id
    JOIN exchange AS ex ON iem1.exchange_id = ex.id AND ex.is_mappable IS TRUE
    JOIN instrument_market_data imd1 ON imd1.id=(
        SELECT id FROM instrument_market_data imdd 
        WHERE imdd.instrument_id=i.id
          AND imdd.exchange_id=iem1.exchange_id
        ORDER BY timestamp DESC
        LIMIT 1
      )
    WHERE a1.symbol='USD'
      AND assetBuy.is_base=true
    GROUP BY assetBuy.id, assetBuy.symbol, imd1.ask_price, imd1.timestamp
    
    UNION 
    
    SELECT assetSell.id, assetSell.symbol as symbol, (1 / imd2.bid_price) as price, imd2.timestamp as timestamp
    FROM asset as a2
    JOIN instrument i ON i.transaction_asset_id=a2.id
    JOIN asset as assetSell ON assetSell.id=i.quote_asset_id
    JOIN instrument_exchange_mapping as iem2 ON iem2.instrument_id=i.id
    JOIN exchange AS ex ON iem2.exchange_id = ex.id AND ex.is_mappable IS TRUE
    JOIN instrument_market_data imd2 ON imd2.id=(
        SELECT id FROM instrument_market_data imdd 
        WHERE imdd.instrument_id=i.id
          AND imdd.exchange_id=iem2.exchange_id
        ORDER BY timestamp DESC
        LIMIT 1
      )
    WHERE a2.symbol='USD'
    AND assetSell.is_base=true
    GROUP BY assetSell.id, assetSell.symbol, imd2.bid_price, imd2.timestamp
  ) as prices
  WHERE prices.timestamp >= NOW() - interval '${ttl_threshold} seconds'
  GROUP BY prices.id, prices.symbol
  `, {
    type: sequelize.QueryTypes.SELECT
  }));

  if (err) TE(err.message);

  if (!prices.length){
    const message_start = `No base asset prices in USD for past ${Math.floor(ttl_threshold/60)} minutes found!`;

    const existing_mappings = await InstrumentExchangeMapping.findAll({
      where: {
        external_instrument_id: {
          [Op.or]: [
            { [Op.iLike]: '%/USDT' }, { [Op.iLike]: '%/USD' }
          ]
        }
      }
    });
    const missing_exchanges = await Exchange.findAll({
      where: {
        id: {
          [Op.notIn]: _.map(existing_mappings, 'exchange_id')
        },
        is_mappable: true
      }
    });
    if (!_.isEmpty(missing_exchanges)) {
      const missing_exchanges_message = `Missing USDT instrument mappings for exchanges: ${_.join(_.map(missing_exchanges, 'name'), ', ')}. 
      Please use/create an instrument with either 'Us Dollars' or 'Tether' as the Quote Asset and add the missing mappings`;

      TE(message_start + '\n' + missing_exchanges_message);
    } else {
      //we really are missing recent ask/bids
      const missing_prices = `Missing recent prices. Please wait for new prices to be fetched 
      OR manually launch the job EXCH_ASK_BID, 
      OR increase its automatic frequency, 
      OR increase the BASE_ASSET_PRICE_TTL_THRESHOLD system threshold to allow for older price points.`;

      TE(message_start + '\n' + missing_prices);
    }

  } 

  prices.map(p => {
    Object.assign(p, {
      price: parseFloat(p.price),
    });
  });

  return prices;
}
module.exports.getBaseAssetPrices = getBaseAssetPrices;

const fetchAssetStatusHistory = async (asset) => {

  const sorted_history = await AssetStatusChange.findAll({
    where: {
      asset_id: asset.id
    },
    include: [
      {
        model: User
      }
    ],
    order: [
      ['timestamp', 'DESC']
    ]
  })

  return sorted_history;
}
module.exports.fetchAssetStatusHistory = fetchAssetStatusHistory;

const getDepositAssets = async () => {
  
  let [err, assets] = await to(Asset.findAll({
    where: {
      is_deposit: true
    }
  }));

  if (err) TE(err.message);

  return assets;
};
module.exports.getDepositAssets = getDepositAssets;

const getAssetGroupWithData = async function (investment_run_id) {

  // query recives all whitelisted asset/instrument/exchange pairs.
  // Flip if asset to be bought is in quote, to get sell order, calculate price_usd accordingly.
  let [err, asset_group] = await to(sequelize.query(`
    WITH base_assets_with_prices AS (
      SELECT a.id, a.symbol, a.long_name, a.is_base, a.is_deposit, AVG (prices.ask_price) as value_usd
      FROM asset a
      JOIN instrument i ON i.transaction_asset_id=a.id
      LEFT JOIN instrument_exchange_mapping iem ON iem.instrument_id=i.id
      LEFT JOIN asset quote_asset ON quote_asset.id=i.quote_asset_id
      LEFT JOIN LATERAL (
        SELECT imd.ask_price
        FROM instrument_market_data imd
        WHERE imd.instrument_id=iem.instrument_id
        ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
        LIMIT 1
      ) as prices ON TRUE
      WHERE a.is_base = TRUE
        AND ( quote_asset.symbol='USD' OR quote_asset.symbol='USDT')
      GROUP BY a.id
    )
    SELECT asset.id,
      asset.symbol,
      asset.long_name,
      asset.is_base,
      asset.is_deposit,
      CASE WHEN asset.id=i.quote_asset_id THEN i.quote_asset_id ELSE i.transaction_asset_id END as transaction_asset_id,
			CASE WHEN asset.id=i.quote_asset_id THEN i.transaction_asset_id ELSE i.quote_asset_id END as quote_asset_id,
      iem.instrument_id,
      iem.exchange_id,
      exchange.name as exchange_name,
      nvt_calc.value as nvt,
      lh.volume,
      (lh.volume * ask_price * base_price.value_usd) as volume_usd,
      ask_price,
      bid_price,
      imd.timestamp as imd_updated,
      (	CASE WHEN asset.id=i.transaction_asset_id
          THEN (ask_price * base_price.value_usd)
          ELSE ((1 / bid_price) * base_price.value_usd)
        END
      )as price_usd,
      CASE WHEN ga.status IS NULL THEN 400 ELSE ga.status END as status
    FROM investment_run ir
    JOIN investment_run_asset_group irag ON irag.id=ir.investment_run_asset_group_id
    JOIN group_asset ga ON ga.investment_run_asset_group_id=irag.id
    JOIN asset ON asset.id=ga.asset_id
    JOIN instrument i ON i.transaction_asset_id=asset.id OR i.quote_asset_id=asset.id
    JOIN instrument_exchange_mapping iem ON instrument_id=i.id
    JOIN exchange ON exchange.id=iem.exchange_id AND exchange.is_mappable IS TRUE
    LEFT JOIN LATERAL
    (
      SELECT value
      FROM market_history_calculation
      WHERE asset_id=asset.id AND type=0
      ORDER BY asset_id NULLS LAST, timestamp DESC NULLS LAST
      LIMIT 1
    ) AS nvt_calc ON TRUE
    LEFT JOIN LATERAL
    (
      SELECT instrument_id, exchange_id, volume, timestamp_from
      FROM instrument_liquidity_history ilh
      WHERE ilh.instrument_id=iem.instrument_id AND ilh.exchange_id=iem.exchange_id
      ORDER BY ilh.instrument_id NULLS LAST, ilh.exchange_id NULLS LAST, ilh.timestamp_from DESC NULLS LAST
      LIMIT 1
    ) AS lh ON TRUE
    LEFT JOIN LATERAL 
    (
      SELECT ask_price, bid_price, timestamp
      FROM instrument_market_data 
      WHERE instrument_id=iem.instrument_id
        AND exchange_id=iem.exchange_id
        AND timestamp >= NOW() - interval ':oldness_time seconds'
      ORDER BY instrument_id NULLS LAST, exchange_id NULLS LAST, timestamp DESC NULLS LAST
      LIMIT 1
    ) as imd ON TRUE
    LEFT JOIN base_assets_with_prices as base_price ON base_price.id=i.quote_asset_id OR base_price.id=i.transaction_asset_id
    WHERE ir.id=:investment_run_id
        AND (ga.status=:whitelisted OR ga.status IS NULL)
    ORDER BY nvt DESC, volume_usd DESC, price_usd ASC
  `, {
    replacements: {
      investment_run_id,
      whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
      oldness_time: SYSTEM_SETTINGS.BASE_ASSET_PRICE_TTL_THRESHOLD
    },
    type: sequelize.QueryTypes.SELECT
  }));

  let properties = ['nvt', 'volume_usd', 'price_usd']; // properties that shouldn't be null
  let groups_missing_data = _(asset_group)
    .groupBy(asset_group, 'id')
    .values()
    .filter(
      group => group.every(
        asset => roperties.some(prop => _.isNull(asset[prop]))
      )
    );

  if (groups_missing_data.length) {
    let missing = _.take(groups_missing_data, 1);
    TE(`${missing.long_name} is missing ${properties.find(p => _.isNull(missing[p]))} data`);
  }
  
  if (err) TE(err.message);

  return asset_group;
};
module.exports.getAssetGroupWithData = getAssetGroupWithData;

/** Liquidity levels are defined in CryptX according to the following table, whereby
 * the USD amount denotes the trading volume over the last 24 hours on a connected exchange. 
 * @param {*} volume_usd Volume of traded asset represented in USD 
 */
const getLiquidityLevel = (volume_usd) => {

  let level = LIQUIDITY_LEVELS.find(l => 
    (l.from <= volume_usd && l.to > volume_usd) || 
    (l.from <= volume_usd && !l.to)
  );

  return level;
};
module.exports.getLiquidityLevel = getLiquidityLevel;

const getAssetFilteringBasedOnInvestmentAssetGroup = async (id, seq_query = {}, sql_where = '') => {

  let [ err, asset_group ] = await to(InvestmentRunAssetGroup.findById(id, {
    include: {
      model: GroupAsset
    }
  }));

  if(err) TE(err.message);
  if(!asset_group) return null;

  const asset_ids = _.map(asset_group.GroupAssets, group_asset => group_asset.asset_id).filter(id => id);

  seq_query.where = { 
    [Op.and]: [
      { id: asset_ids },
      seq_query.where
    ] 
  };

  if(asset_ids.length) sql_where = `id IN(${asset_ids.join(', ')}) ${ sql_where !== '' ? `AND ${sql_where}` : '' }`;

  return [ seq_query, sql_where, asset_group.GroupAssets ];  

};
module.exports.getAssetFilteringBasedOnInvestmentAssetGroup = getAssetFilteringBasedOnInvestmentAssetGroup;

const getExchangeMappedAssets = async (exchange_id) => {

  const [ err, exchange ] = await to(Exchange.findById(exchange_id));

  if(err) TE(err.message);
  if(!exchange) return null;

  return sequelize.query(`
    WITH exchange_instruments AS (
        SELECT
            DISTINCT ON(ins.id)
            *
        FROM instrument AS ins
        JOIn instrument_exchange_mapping AS iem ON iem.exchange_id = :exchange_id AND iem.instrument_id = ins.id
    )

    SELECT
        DISTINCT ON(asset.symbol, asset.id)
        asset.id,
        asset.symbol
    FROM asset
    JOIN exchange_instruments AS ei ON ei.transaction_asset_id = asset.id OR ei.quote_asset_id = asset.id
    ORDER BY asset.symbol, asset.id ASC
  `, {
    type: sequelize.QueryTypes.SELECT,
    replacements: { exchange_id }
  });

};
module.exports.getExchangeMappedAssets = getExchangeMappedAssets;