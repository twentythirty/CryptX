"use strict";

const { logAction } = require('../utils/ActionLogUtil');
const action_path = 'asset_status_changer';

const actions = {
  graylisted: `${action_path}.graylisted`,
  whitelisted: `${action_path}.whitelisted`,
};

// every day 20 minutes past midnight
module.exports.SCHEDULE = "0 20 * * *";
module.exports.NAME = "ASSET_LIQUIDITY_CHK";
module.exports.JOB_BODY = async (config, log) => {

  //reference shortcuts
  const models = config.models;
  const sequelize = models.sequelize;
  const AssetStatusChange = models.AssetStatusChange;

  let [err, result] = await to(sequelize.query(`
    SELECT 
      asset.*,
      ilr.minimum_volume,
      ilr.periodicity_in_days,
      AVG(ilh.volume) as avg_volume,
      ilh.exchange_id,
      CASE WHEN status.type IS NULL THEN :whitelisted ELSE status.type END as status
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

    WHERE status.type <> :blacklisted OR status.type IS NULL

    GROUP BY asset.id, ilr.id, i.id, ilh.exchange_id, status.type
  `, {
    replacements: { // replace keys with values in query
      whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
      blacklisted: INSTRUMENT_STATUS_CHANGES.Blacklisting
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

      // if asset is whitelisted

      // true == change asset status
      // if asset is whitelisted, and every asset don't meet requirements, then we should change status
      // if asset is not whitelisted, and some asset meet requirements, then we should whitelist it
      if (liq.some(a => // check if all exchanges don't pass liquidity requirements instrument
        !_.isNull(a.volume) && parseFloat(a.avg_volume) > parseFloat(a.minimum_volume)
      )) {
        if (asset.status==INSTRUMENT_STATUS_CHANGES.Graylisting)
          change_status = true
      } else {
        if (asset.status==INSTRUMENT_STATUS_CHANGES.Whitelisting)
          change_status = true;
      }

      return change_status;
    })
    .map(liq => _.first(liq))
    .value();

  if (!change_asset_status.length)
    return [];
  else
    return AssetStatusChange.bulkCreate(change_asset_status.map(asset => {
      let type, comment;

      if (asset.status == INSTRUMENT_STATUS_CHANGES.Whitelisting) {
        type = INSTRUMENT_STATUS_CHANGES.Graylisting;
        comment = "Doesn't meet liquidity requirements";
        logAction(actions.graylisted, {
          args: { 
            asset_name: asset.long_name,
            asset_symbol: asset.symbol },
          relations: { asset_id: asset.id }
        });
      } else {
        type = INSTRUMENT_STATUS_CHANGES.Whitelisting;
        comment = "Meets liquidity requirements";
        logAction(actions.whitelisted, {
          args: { 
            asset_name: asset.long_name,
            asset_symbol: asset.symbol },
          relations: { asset_id: asset.id }
        });
      }

      return {
        timestamp: new Date(),
        asset_id: asset.id,
        comment: comment,
        type: type
      }
    }));
};