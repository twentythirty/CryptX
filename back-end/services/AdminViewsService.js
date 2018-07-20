'use strict';


const sequelize = require('../models').sequelize;
const builder = require('../utils/AdminViewUtils');
const AVUser = require('../models').AVUser;
const AVAsset = require('../models').AVAsset;
const AVInstrument = require('../models').AVInstrument;
const AVInvestmentRun = require('../models').AVInvestmentRun;

const TABLE_LOV_FIELDS = {
    'av_users': [
        'first_name',
        'last_name',
        'email',
        'is_active'
    ],
    'av_assets': [
        'symbol',
        'is_base',
        'is_deposit',
        'is_cryptocurrency',
        'long_name',
        'status'
    ],
    'av_instruments': [
        'symbol'
    ]
}

// ************************ HELPERS ***************************//
const fetchViewHeaderLOV = async (table, field, query) => {

    const allowed_fields = TABLE_LOV_FIELDS[table];

    if (allowed_fields == null || !allowed_fields.includes(field)) {
        return [];
    }

    const sql = builder.selectDistinct(field, table, query ? `${field} LIKE ${sequelize.escape(`%${query}%`)}` : '')

    //returns list of objects with 1 key-value pair, key being field name
    const values = await sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT
    });

    //extrac field values from key value pairs
    return _.map(values, field);
}
const fetchViewDataWithCount = async (model, seq_query = {}) => {

    const [data, total] = await Promise.all([
        fetchModelData(model, seq_query),
        fetchModelCount(model)
    ]);

    return {
        data,
        total
    }
}
const fetchModelData = async (model, seq_query = {}) => model.findAll(seq_query)
const fetchModelCount = async (model) => model.count()
const fetchSingleEntity = async (model, id) => {

    return _.first(await fetchModelData(model, {
        where: {
            id: id
        }
    }))
}

const fetchMockHeaderLOV = async (header_field, query = '') => {
    // mock data below
    return ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];
}
module.exports.fetchMockHeaderLOV = fetchMockHeaderLOV;




// ************************ HEADERS ***************************//

const fetchUsersViewHeaderLOV = async (header_field, query = '') => {

    return fetchViewHeaderLOV('av_users', header_field, query)
}
module.exports.fetchUsersViewHeaderLOV = fetchUsersViewHeaderLOV;

const fetchAssetsViewHeaderLOV = async (header_field, query = '') => {

    return fetchViewHeaderLOV('av_assets', header_field, query)
}
module.exports.fetchAssetsViewHeaderLOV = fetchAssetsViewHeaderLOV;

const fetchInstrumentsViewHeaderLOV = async (header_field, query = '') => {

    return fetchViewHeaderLOV('av_instruments', header_field, query);
}
module.exports.fetchInstrumentsViewHeaderLOV = fetchInstrumentsViewHeaderLOV;





// ************************ DATA ***************************//

const fetchUsersViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVUser, seq_query);
}
module.exports.fetchUsersViewDataWithCount = fetchUsersViewDataWithCount;

const fetchAssetsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVAsset, seq_query);
}
module.exports.fetchAssetsViewDataWithCount = fetchAssetsViewDataWithCount;

const fetchInstrumentsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVInstrument, seq_query);
}
module.exports.fetchInstrumentsViewDataWithCount = fetchInstrumentsViewDataWithCount;

const fetchInvestmentRunsViewDataWithCount = async (seq_where = {}) => {

    return fetchViewDataWithCount(AVInvestmentRun, seq_where);
}
module.exports.fetchInvestmentRunsViewDataWithCount = fetchInvestmentRunsViewDataWithCount;

const fetchAssetView = async (asset_id) => {

    return fetchSingleEntity(AVAsset, asset_id)
}
module.exports.fetchAssetView = fetchAssetView;

const fetchInstrumentView = async (instrument_id) => {

    return fetchSingleEntity(AVInstrument, instrument_id)
}
module.exports.fetchInstrumentView = fetchInstrumentView;



// ************************ FOOTERS ***************************//

const fetchUsersViewFooter = async (where_clause = '') => {

    const simple_fields = {
        first_name: 'first_name',
        last_name: 'last_name',
        email: 'email',
        created_timestamp: 'created_timestamp::date'
    }

    const query_parts = _.concat(_.map(simple_fields, (field_expr, alias) => {
            return builder.selectCountDistinct(field_expr, alias, 'av_users', where_clause)
        }),
        //attach the more fancy footer column query as-is to avoid convoluted parametrization
        builder.selectCount('av_users', 'is_active', builder.addToWhere(where_clause, 'is_active = \'users.entity.active\'')));

    const footer_values = (await sequelize.query(builder.joinQueryParts(
        query_parts,
        _.concat(Object.keys(simple_fields), 'is_active')
    )))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer_values), 'users');
}
module.exports.fetchUsersViewFooter = fetchUsersViewFooter;

const fetchAssetsViewFooter = async (where_clause = '') => {

    //using singular ocmplete query due to performance impact of refetching part of this view footer
    const united_query = `
    SELECT 
       SUM(is_base) AS is_base,
       SUM(is_deposit) AS is_deposit,
       SUM(status) AS status,
       COUNT(DISTINCT symbol) AS symbol,
       SUM(is_cryptocurrency) AS is_cryptocurrency,
       SUM(capitalization) AS capitalization
FROM
  (SELECT (CASE WHEN is_base = 'assets.is_base.yes' THEN 1 ELSE 0 END) AS is_base,
          (CASE WHEN is_deposit = 'assets.is_deposit.yes' THEN 1 ELSE 0 END) AS is_deposit,
          (CASE WHEN status = 'assets.status.400' THEN 1 ELSE 0 END) AS status,
          (CASE WHEN is_cryptocurrency = 'assets.is_cryptocurrency.yes' THEN 1 ELSE 0 END) AS is_cryptocurrency,
          symbol,
          capitalization
   FROM av_assets
    ${builder.whereOrEmpty(where_clause)}) AS inner_av
    `

    const footer_values = (await sequelize.query(united_query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer_values), 'assets');
}
module.exports.fetchAssetsViewFooter = fetchAssetsViewFooter;

const fetchInstrumentsViewFooter = async (where_clause = '') => {

    const query = builder.joinQueryParts([
        builder.selectCountDistinct('symbol', 'symbol', 'av_instruments', where_clause),
        builder.selectSum('exchanges_connected', 'av_instruments', where_clause),
        builder.selectSum('exchanges_failed', 'av_instruments', where_clause)
    ], [
        'symbol',
        'exchanges_connected',
        'exchanges_failed'
    ])

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'instruments')
}
module.exports.fetchInstrumentsViewFooter = fetchInstrumentsViewFooter;

const fetchLiquidityViewFooter = async () => {
    // mock data below
    /* let footer = [
        {
          "name": "id",
          "value": "999"
        },
        {
          "name": "exchange_id",
          "value": "999"
        },
        {
          "name": "exchange",
          "value": "999"
        },
        {
          "name": "instrument",
          "value": "999"
        },
        {
          "name": "instrument_identifier",
          "value": "999"
        },
        {
          "name": "last_day_vol",
          "value": "999"
        },
        {
          "name": "last_week_vol",
          "value": "999"
        },
        {
          "name": "last_updated",
          "value": "999"
        },
        {
          "name": "passes",
          "value": "999"
        }
      ];
 */
    let footer = [{
            "name": "id",
            "value": "999"
        },
        {
            "name": "instrument",
            "value": "999"
        },
        {
            "name": "periodicity",
            "value": "999"
        },
        {
            "name": "quote_asset",
            "value": "999"
        },
        {
            "name": "minimum_circulation",
            "value": "999"
        },
        {
            "name": "exchange",
            "value": "999"
        },
        {
            "name": "exchange_count",
            "value": "999"
        },
        {
            "name": "exchange_pass",
            "value": "999"
        }
    ];
    return builder.addFooterLabels(footer, 'liquidity')
}
module.exports.fetchLiquidityViewFooter = fetchLiquidityViewFooter;

const fetchLiquidityExchangesViewFooter = async () => {
    // mock data below

    let footer = [{
            "name": "id",
            "value": "999"
        },
        {
            "name": "exchange_id",
            "value": "999"
        },
        {
            "name": "exchange",
            "value": "999"
        },
        {
            "name": "instrument",
            "value": "999"
        },
        {
            "name": "instrument_identifier",
            "value": "999"
        },
        {
            "name": "last_day_vol",
            "value": "999"
        },
        {
            "name": "last_week_vol",
            "value": "999"
        },
        {
            "name": "last_updated",
            "value": "999"
        },
        {
            "name": "passes",
            "value": "999"
        }
    ];

    return builder.addFooterLabels(footer, 'liquidity_exchanges')
}
module.exports.fetchLiquidityExchangesViewFooter = fetchLiquidityExchangesViewFooter;

const fetchInvestmentRunsViewFooter = async (where_clause = '') => {

    const query = `
    SELECT
        COUNT(id) AS id,
        SUM(completed) AS completed_timestamp,
        COUNT(DISTINCT user_created) AS user_created,
        COUNT(DISTINCT strategy_type) AS strategy_type,
        SUM(is_not_simulated) AS is_simulated,
        SUM(executing) AS status
    FROM
        (SELECT
            id,
            (CASE WHEN completed_timestamp IS NULL THEN 0 ELSE 1 END) AS completed,
            user_created,
            strategy_type,
            (CASE WHEN is_simulated IS FALSE THEN 1 ELSE 0 END) AS is_not_simulated,
            (CASE WHEN status = 307 THEN 1 ELSE 0 END) AS executing
	    FROM av_investment_runs ${builder.whereOrEmpty(where_clause)}) AS inner_av
    `;

    const footer = (await sequelize.query(query))[0];
    
    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'investment_runs');
}
module.exports.fetchInvestmentRunsViewFooter = fetchInvestmentRunsViewFooter;