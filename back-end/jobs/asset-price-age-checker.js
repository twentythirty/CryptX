"use strict";

const { logAction } = require('../utils/ActionLogUtil');
const action_path = 'asset_status_changer';

const actions = {
  graylisted: `${action_path}.graylisted`
};

const REASONS = {
  GRAYLISTING: {
    PRICE_AGE: {
      i18n: '{asset_status_changes.graylisting.price_age}',
      comment: 'Pricing data is not old enough'
    }
  }
};

// at 2 AM every day
module.exports.SCHEDULE = "0 0 2 * * *";
module.exports.NAME = "ASSET_PRICING_AGE_CHK";
module.exports.JOB_BODY = async (config, log) => {

    const { sequelize, AssetStatusChange } = config.models;

    log('1. Fetching whitelisted assets and checking if their pricing is old enough or exists at all');
    let [ err, result ] = await to(sequelize.query(`
        WITH assets_with_status AS (
            SELECT
                asset.*,
                status.type AS status
            FROM asset
            LEFT JOIN LATERAL (
                SELECT *
                FROM asset_status_change
                WHERE asset_id=asset.id
                ORDER BY asset_id NULLS LAST, timestamp DESC NULLS LAST
                LIMIT 1
            ) AS status ON TRUE
            WHERE asset.is_deposit IS FALSE AND asset.is_base IS FALSE
        ),
        active_exchanges AS (
            SELECT * FROM exchange WHERE exchange.is_mappable IS TRUE
        )
        
        SELECT
            asset.*,
            CASE
                WHEN EXISTS (
                    SELECT * FROM instrument_market_data AS imd
                    INNER JOIN active_exchanges AS ex on ex.id = imd.exchange_id
                    WHERE imd.instrument_id = i.id AND imd.timestamp <= NOW() - INTERVAL :minimum_age
                )
                THEN TRUE
                ELSE FALSE
            END AS price_old_enough
        FROM assets_with_status AS asset
        LEFT JOIN instrument AS i ON i.transaction_asset_id = asset.id
        WHERE asset.status = :whitelisted OR asset.status IS NULL
    `, {
        replacements: {
            whitelisted: INSTRUMENT_STATUS_CHANGES.Whitelisting,
            minimum_age: ASSET_PRICING_MIN_AGE
        },
        type: sequelize.QueryTypes.SELECT
    }));

    if(err) {
        log(`[ERROR.1A] Error occured while fetching whitelisted assets: ${err.message}`);
        return;
    }

    if(!result.length) {
        log(`[WARN.1A] no whitelisted assets found, skipping...`);
        return;
    }

    const asset_groups = _.groupBy(result, 'id');

    log(`2. Checking ${_.size(asset_groups)} whitelisted assets from price age`);
    //Using promise for the action log in cucumber.
    let status_changes =  await Promise.all(_.map(asset_groups, async (assets, asset_id) => {

        const asset = _.first(assets);

        //If all found asset relations don't have old enough price, they will be graylisted
        if(assets.every(asset => !asset.price_old_enough)) {

            log(`Asset ${asset.long_name} ${asset.symbol} pricing is not old enough it is not available. Graylisting...`);

            await logAction(actions.graylisted, {
                args: { 
                  asset_name: asset.long_name,
                  asset_symbol: asset.symbol ,
                  reason: REASONS.GRAYLISTING.PRICE_AGE.i18n
                },
                relations: { asset_id: asset.id }
              });

            return {
                asset_id: asset.id,
                comment: REASONS.GRAYLISTING.PRICE_AGE.comment,
                timestamp: Date.now(),
                type: INSTRUMENT_STATUS_CHANGES.Graylisting
            }
 
        }

        return;

    }));

    status_changes = status_changes.filter(sc => sc);//Filter out undefineds

    log(`3. There are ${status_changes.length} Assets that need to be Greylisted`);

    if(!status_changes.length) return;

    [ err ] = await to(AssetStatusChange.bulkCreate(status_changes)); 

    if(err) log(`[ERROR.3A] Error occured during status changes saving: ${err.message}`);

    return;

}