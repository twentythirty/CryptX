'use strict';
var request_promise = require('request-promise');

module.exports.SCHEDULE = '0 1 */2 * * *';
module.exports.NAME = 'CALC_MH';

const NVT_MA_DAYS = 7;

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

module.exports.JOB_BODY = async (config) => {

    const sequelize = config.models.sequelize;

    console.log(`1. Checking for valid date ranges on coins...`);

    return sequelize.query(`
        SELECT asset_id,
        low_ts,
            CASE
                WHEN low_ts <= NOW() - interval '${NVT_MA_DAYS} days' THEN 1
                ELSE 0
            END AS old_enough
        FROM
        (SELECT asset_id,
            MIN(TIMESTAMP) AS low_ts
        FROM asset_market_capitalization
        GROUP BY asset_id) AS time_check
    `, {
        type: sequelize.QueryTypes.SELECT
    }).then(results => {

        console.log(`2.Filtering down to coins with enough data for NVT...`);

        const good_asset_ids = _.filter(results,
            obj => obj.old_enough
        ).map(obj => obj.asset_id);

        if (good_asset_ids.length == 0) {

            return Promise.resolve(`
            ERR: No coins with enough market data to calculate NVT!
            Earliest data was: ${_.minBy(results, 'low_ts').low_ts}
            `);
        } else {

            console.log(`3. Executing nested averages query fo fetch per-coin NVT for ${good_asset_ids.length} coins...`);

            const days_seq = _.map(Array(NVT_MA_DAYS), (_, idx) => idx);
            const good_assets_string = good_asset_ids.toString();
            const day_queries = _.map(days_seq, 
                val => dailyNVTTemplate(val, good_assets_string)
            );

            const joined_query = _.join(day_queries, `
            UNION
            `);

            return sequelize.query(`
                SELECT 
                    asset_id as asset_id,
                    avg(nvt) as nvt
                FROM (
                    ${joined_query}
                ) as daily_nvts
                GROUP BY asset_id
            `, {
                type: sequelize.QueryTypes.SELECT
            }).then(results => {

                console.log(`4. Saving ${results.length} results...`);

                //insert all in one query
                sequelize.queryInterface.bulkInsert('market_history_calculation',
                    _.map(results, obj => {

                        return {
                            timestamp: new Date(),
                            type: MARKET_HISTORY_CALCULATION_TYPES.NVT,
                            value: obj.nvt,
                            asset_id: obj.asset_id
                        }
                    }));
            });
        }
    });
};