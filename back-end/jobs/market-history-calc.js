'use strict';
var request_promise = require('request-promise');
//run once a day, 1 hour past midnight every night
module.exports.SCHEDULE = '0 0 1 * * *';
module.exports.NAME = 'CALC_MH';

const NVT_MA_DAYS = 7;
module.exports.NVT_MA_DAYS = NVT_MA_DAYS;

const dailyNVTTemplate = (dayFrom, asset_ids_string) => { 
    return `
    (SELECT asset_id,
          avg(capitalization_usd / daily_volume_usd) AS nvt
   FROM asset_market_capitalization
   WHERE (TIMESTAMP < NOW() - interval '${dayFrom} days'
          AND TIMESTAMP > NOW() - interval '${dayFrom + 1} days')
     AND asset_id IN (${asset_ids_string})
   GROUP BY asset_id)
    `
};

module.exports.JOB_BODY = async (config, log) => {

    const sequelize = config.models.sequelize;

    log(`1. Checking for valid date ranges on coins...`);

    let [ err, nvt_data ] = await to(sequelize.query(`
        WITH average_daly_volumes AS (
            SELECT
                AVG(daily_volume_usd) AS volume,
                MIN("timestamp") AS earliest_timestamp,
                asset_id
            FROm asset_market_capitalization
            WHERE "timestamp" >= (NOW() - INTERVAL '7 days')::DATE AND "timestamp" < NOW()::DATE
            GROUP BY asset_id
        ),
        last_day_average_capitalizations AS (
            SELECT
                AVG(capitalization_usd) AS capitalization,
                asset_id
            FROM asset_market_capitalization
            WHERE "timestamp" >= (NOW() - INTERVAL '1 days')::DATE AND "timestamp" < NOW()::DATE
            GROUP BY asset_id
        )
        
        SELECT
            cap.asset_id,
            (cap.capitalization/adv.volume) AS nvt,
            CASE
                WHEN adv.earliest_timestamp::DATE <= (NOW() - INTERVAL '7 days')::DATE THEN TRUE
                ELSE FALSE
            END AS old_enough,
            adv.earliest_timestamp
        FROM last_day_average_capitalizations AS cap
        INNER JOIN average_daly_volumes AS adv ON adv.asset_id = cap.asset_id       
    `, {
        type: sequelize.QueryTypes.SELECT
    }));

    if(err) {
        return log(`ERROR(1A): ${err.message}`);
        
    }
    //console.log(JSON.stringify(nvt_data, null, 4));
    //console.log(nvt_data[0].earliest_timestamp);
    log(`2.Filtering down to coins with enough data for NVT...`);

    const eligible_data = _.filter(nvt_data, data => data.old_enough);

    if (eligible_data.length == 0) {

        return Promise.resolve(`
            ERROR: No coins with enough market data to calculate NVT!
            Earliest data was: ${_.minBy(results, 'earliest_timestamp').earliest_timestamp}
        `);
    }

    log(`3. Saving ${eligible_data.length} results...`);

    [ err ] = await to(sequelize.queryInterface.bulkInsert('market_history_calculation',
        _.map(eligible_data, data => {

            return {
                timestamp: new Date(),
                type: MARKET_HISTORY_CALCULATION_TYPES.NVT,
                value: data.nvt,
                asset_id: data.asset_id
            }
        })
    ));

    if(err) {
        return log(`ERROR(3A): ${err.message}`);
    }

};