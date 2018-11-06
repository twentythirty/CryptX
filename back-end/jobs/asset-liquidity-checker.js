"use strict";

const { logAction } = require('../utils/ActionLogUtil');
const action_path = 'asset_status_changer';

const actions = {
  graylisted: `${action_path}.graylisted`,
  whitelisted: `${action_path}.whitelisted`,
};

const REASONS = {
  WHITELISTING: {
    LIQUIDITY: {
      i18n: '{asset_status_changes.whitelisting.liqudity}',
      comment: 'Meets liquidity requirements'
    }
  },
  GRAYLISTING: {
    LIQUIDITY: {
      i18n: '{asset_status_changes.graylisting.liquidity}',
      comment: 'Doesn\'t meet liquidity requirements'
    }
  }
};

// every 5 minutes
module.exports.SCHEDULE = "0 */5 * * * *";
module.exports.NAME = "ASSET_LIQUIDITY_CHK";
module.exports.JOB_BODY = async (config, log) => {

  //reference shortcuts
  const models = config.models;
  const sequelize = models.sequelize;
  const AssetStatusChange = models.AssetStatusChange;

  log(`Fetch liquidity requirements with average volumes for every exchange`);
  let [err, result] = await to(sequelize.query(`
    WITH active_exchanges AS (
        SELECT * FROM exchange WHERE exchange.is_mappable IS TRUE
    )

    SELECT 
      asset.*,
      ilr.minimum_volume,
      ilr.periodicity_in_days,
      AVG(ilh.quote_volume) as avg_volume,
      ilh.exchange_id,
      CASE WHEN status.type IS NULL THEN :whitelisted ELSE status.type END as status,
      apc.price_old_enough
    FROM instrument_liquidity_requirement ilr
    JOIN instrument i ON i.id=ilr.instrument_id
    JOIN asset ON asset.id=i.transaction_asset_id
    LEFT JOIN LATERAL (
      SELECT *
      FROM asset_status_change
      WHERE asset_id=asset.id
      ORDER BY asset_id NULLS LAST, timestamp DESC NULLS LAST
      LIMIT 1
    ) AS status ON TRUE
    LEFT JOIN instrument_liquidity_history ilh ON (
      ilh.instrument_id=i.id
      AND timestamp_to > NOW() - interval '1 day' * ilr.periodicity_in_days
      AND (ilh.exchange_id=ilr.exchange
      OR ilr.exchange IS NULL ) 
    )
    LEFT JOIN LATERAL (
        SELECT 
            CASE
                WHEN EXISTS (
                    SELECT * FROM instrument_market_data AS imd
                    INNER JOIN active_exchanges AS ex ON ex.id = imd.exchange_id
                    WHERE imd.instrument_id = i.id AND imd.timestamp <= NOW() - INTERVAL :minimum_age
                )
                THEN TRUE
                ELSE FALSE
            END AS price_old_enough 
        FROM asset AS a
        JOIn instrument AS i ON i.transaction_asset_id = asset.id
        WHERE a.id = asset.id
    ) AS apc ON TRUE AND apc.price_old_enough IS TRUE

    JOIN active_exchanges AS ex ON ex.id = ilh.exchange_id

    WHERE status.type <> :blacklisted OR status.type IS NULL

    GROUP BY asset.id, ilr.id, i.id, ilh.exchange_id, status.type, apc.price_old_enough
  `, {
    replacements: { // replace keys with values in query
      whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
      blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting,
      minimum_age: ASSET_PRICING_MIN_AGE
    },
    type: sequelize.QueryTypes.SELECT
  }));
  if (err) TE(err.message);

  if (!result.length) return [];

  let change_asset_status = [];
  
  change_asset_status = _(result)
    .groupBy('id')
    .filter(liq => {
      let asset = _.first(liq);
      let change_status = false;

      // check the price age first
      if (liq.every(a => !a.price_old_enough)) { //If at all instrument prices is not old enough
        
        log(`All of the instruments for ${asset.long_name}(${asset.symbol}) don't have pricing from ${ASSET_PRICING_MIN_AGE} ago`);

        return change_status; //End here, as the asset does not meet the price requirement.

      }

      // if asset is whitelisted

      // if true is returned then asset status should be changed
      // if asset is whitelisted, and every asset don't meet requirements, then we should change status
      // if asset is not whitelisted, and some asset meet requirements, then we should whitelist it
      if (liq.some(a => // check if all exchanges don't pass liquidity requirements instrument
        !_.isNull(a.volume) && parseFloat(a.avg_volume) > parseFloat(a.minimum_volume)
      )) {
        log(`Some of exchange mappings for ${asset.long_name}(${asset.symbol}) meet liquidity requirements.`);

        if (asset.status==INSTRUMENT_STATUS_CHANGES.Graylisting) {
          asset.change_status_to = INSTRUMENT_STATUS_CHANGES.Whitelisting;
          asset.reason = REASONS.WHITELISTING.LIQUIDITY.comment;

          logAction(actions.whitelisted, {
            args: { 
              asset_name: asset.long_name,
              asset_symbol: asset.symbol,
              reason: REASONS.WHITELISTING.LIQUIDITY.i18n
            },
            relations: { asset_id: asset.id }
          });
  
          log(`Whitelisting ${asset.long_name}(${asset.symbol})`);
        
          change_status = true;
        } else {

          log(`Leaving ${asset.long_name}(${asset.symbol}) status as is - whitelisted.`);
        }
      } else {
        log(`None of exchange mappings for ${asset.long_name}(${asset.symbol}) meet liquidity requirements`);

        if (asset.status==INSTRUMENT_STATUS_CHANGES.Whitelisting) {
          asset.change_status_to = INSTRUMENT_STATUS_CHANGES.Graylisting;
          asset.reason = REASONS.GRAYLISTING.LIQUIDITY.comment;

          logAction(actions.graylisted, {
            args: { 
              asset_name: asset.long_name,
              asset_symbol: asset.symbol ,
              reason: REASONS.GRAYLISTING.LIQUIDITY.i18n
            },
            relations: { asset_id: asset.id }
          });
  
          log(`Graylisting ${asset.long_name}(${asset.symbol})`);

          change_status = true;
        } else {

          log(`Leaving ${asset.long_name}(${asset.symbol}) status as is - graylisted.`);
        }
      }

      return change_status;
    })
    .map(liq => _.first(liq))
    .value();

  if (!change_asset_status.length)
    return [];
  else
    return AssetStatusChange.bulkCreate(change_asset_status.map(asset => {

      return {
        timestamp: new Date(),
        asset_id: asset.id,
        comment: asset.reason,
        type: asset.change_status_to
      }
    }));
};