'use strict';


const sequelize = require('../models').sequelize;
const builder = require('../utils/AdminViewUtils');
const AVUser = require('../models').AVUser;
const Role = require('../models').Role;
const AVAsset = require('../models').AVAsset;
const AVInstrument = require('../models').AVInstrument;
const AVInvestmentRun = require('../models').AVInvestmentRun;
const AVRecipeRun = require('../models').AVRecipeRun;
const AVRecipeRunDetail = require('../models').AVRecipeRunDetail;
const AVInstrumentExchange = require('../models').AVInstrumentExchange;
const AVInstrumentLiquidityRequirement = require('../models').AVInstrumentLiquidityRequirement;
const AVLiquidityRequirementExchange = require('../models').AVLiquidityRequirementExchange;
const AVRecipeDeposit = require('../models').AVRecipeDeposit;
const AVRecipeOrdersGroup = require('../models').AVRecipeOrdersGroup;
const AVRecipeOrder = require('../models').AVRecipeOrder;
const AVExecutionOrder = require('../models').AVExecutionOrder;
const AVExecutionOrderFill = require('../models').AVExecutionOrderFill;
const AVColdStorageTransfer = require('../models').AVColdStorageTransfer;
const AVColdStorageAccount = require('../models').AVColdStorageAccount;

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
    ],
    'av_investment_runs': [
        'is_simulated',
        'user_created',
        'strategy_type',
        'status'
    ],
    'av_recipe_runs': [
        'id', 
        'investment_run_id',
        'user_created', 
        'approval_status', 
        'approval_user'
    ],
    'av_recipe_run_details': [
        'transaction_asset',
        'quote_asset',
        'target_exchange'
    ],
    'av_instrument_liquidity_requirements': [
        'instrument',
        'periodicity',
        'quote_asset',
        'exchange'
    ],
    'av_recipe_orders': [
        'investment_id',
        'instrument',
        'side',
        'exchange',
        'status'
    ],
    'av_execution_orders': [
        'investment_run_id',
        'instrument',
        'side',
        'exchange',
        'type',
        'status'
    ],
    'av_execution_order_fills': [
        'id'
    ],
    'av_recipe_deposits': [
        'investment_run_id',
        'quote_asset',
        'exchange',
        'account',
        'status'
    ],
    'av_cold_storage_transfers': [
        'asset',
        'status',
        'custodian',
        'strategy',
        'source_exchange'
    ],
    'av_cold_storage_accounts': [
        'asset',
        'strategy_type',
        'custodian'
    ]
}

// ************************ HELPERS ***************************//
const fetchViewHeaderLOV = async (table, field, query, where_clause = '') => {

    const allowed_fields = TABLE_LOV_FIELDS[table];

    if (allowed_fields == null || !allowed_fields.includes(field)) {
        return [];
    }

    const sql = builder.selectDistinct(field, table, builder.addToWhere(where_clause, query ? `${field} LIKE ${sequelize.escape(`%${query}%`)}` : ''))

    //returns list of objects with 1 key-value pair, key being field name
    const values = await sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT
    });

    //extrac field values from key value pairs
    return _.map(values, field);
}
const fetchViewDataWithCount = async (model, seq_query = {}) => {

    const { rows: data, count: total } = await model.findAndCountAll(seq_query);

    return {
        data,
        total
    }
}
const fetchModelData = async (model, seq_query = {}) => model.findAll(seq_query)
const fetchModelCount = async (model, seq_query = {}) => model.count(seq_query)
const fetchSingleEntity = async (model, id, alias = 'id') => {

    return _.first(await fetchModelData(model, {
        where: {
            [alias]: id
        }
    }))
}

const fetchMockHeaderLOV = async (header_field, query = '') => {
    // mock data below
    return ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];
}
module.exports.fetchMockHeaderLOV = fetchMockHeaderLOV;




// ************************ HEADERS ***************************//

const fetchUsersViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_users', header_field, query, where)
}
module.exports.fetchUsersViewHeaderLOV = fetchUsersViewHeaderLOV;

const fetchAssetsViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_assets', header_field, query, where)
}
module.exports.fetchAssetsViewHeaderLOV = fetchAssetsViewHeaderLOV;

const fetchInstrumentsViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_instruments', header_field, query, where);
}
module.exports.fetchInstrumentsViewHeaderLOV = fetchInstrumentsViewHeaderLOV;

const fetchInvestmentRunsViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_investment_runs', header_field, query, where);
}
module.exports.fetchInvestmentRunsViewHeaderLOV = fetchInvestmentRunsViewHeaderLOV;

const fetchRecipeRunsViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_recipe_runs', header_field, query, where);
}
module.exports.fetchRecipeRunsViewHeaderLOV = fetchRecipeRunsViewHeaderLOV;

const fetchRecipeRunDetailsViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_recipe_run_details', header_field, query, where);
}
module.exports.fetchRecipeRunDetailsViewHeaderLOV = fetchRecipeRunDetailsViewHeaderLOV;

const fetchInstrumentLiquidityRequirementsViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_instrument_liquidity_requirements', header_field, query, where);
}
module.exports.fetchInstrumentLiquidityRequirementsViewHeaderLOV = fetchInstrumentLiquidityRequirementsViewHeaderLOV;

const fetchRecipeOrdersViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_recipe_orders', header_field, query, where);
}
module.exports.fetchRecipeOrdersViewHeaderLOV = fetchRecipeOrdersViewHeaderLOV;

const fetchExecutionOrdersViewHeaderLOV = async (header_field, query = '', where = '') => {

    return fetchViewHeaderLOV('av_execution_orders', header_field, query, where);
}
module.exports.fetchExecutionOrdersViewHeaderLOV = fetchExecutionOrdersViewHeaderLOV;

const fetchExecutionOrderFillsViewHeaderLOV = async (header_field, query ='', where = '') => {

    return fetchViewHeaderLOV('av_execution_order_fills', header_field, query, where);
}
module.exports.fetchExecutionOrderFillsViewHeaderLOV = fetchExecutionOrderFillsViewHeaderLOV;

const fetchRecipeDepositsViewHeaderLOV = async (header_field, query ='', where = '') => {

    return fetchViewHeaderLOV('av_recipe_deposits', header_field, query, where);
}
module.exports.fetchRecipeDepositsViewHeaderLOV = fetchRecipeDepositsViewHeaderLOV;

const fetchColdStorageTransfersViewHeaderLOV = async (header_field, query ='', where = '') => {

    return fetchViewHeaderLOV('av_cold_storage_transfers', header_field, query, where);
}
module.exports.fetchColdStorageTransfersViewHeaderLOV = fetchColdStorageTransfersViewHeaderLOV;

const fetchColdStorageAccountsViewHeaderLOV = async (header_field, query ='', where = '') => {

    return fetchViewHeaderLOV('av_cold_storage_accounts', header_field, query, where);
}
module.exports.fetchColdStorageAccountsViewHeaderLOV = fetchColdStorageAccountsViewHeaderLOV;



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

const fetchInstrumentExchangesViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVInstrumentExchange, seq_query);
}
module.exports.fetchInstrumentExchangesViewDataWithCount = fetchInstrumentExchangesViewDataWithCount;

const fetchInvestmentRunsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVInvestmentRun, seq_query);
}
module.exports.fetchInvestmentRunsViewDataWithCount = fetchInvestmentRunsViewDataWithCount;

const fetchRecipeRunsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVRecipeRun, seq_query);
}
module.exports.fetchRecipeRunsViewDataWithCount = fetchRecipeRunsViewDataWithCount;

const fetchRecipeRunDetailsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVRecipeRunDetail, seq_query);
}
module.exports.fetchRecipeRunDetailsViewDataWithCount = fetchRecipeRunDetailsViewDataWithCount;

const fetchInstrumentLiquidityRequirementsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVInstrumentLiquidityRequirement, seq_query);
}
module.exports.fetchInstrumentLiquidityRequirementsViewDataWithCount = fetchInstrumentLiquidityRequirementsViewDataWithCount;

const fetchLiquidityExchangesViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVLiquidityRequirementExchange, seq_query);
}
module.exports.fetchLiquidityExchangesViewDataWithCount = fetchLiquidityExchangesViewDataWithCount;

const fetchRecipeOrdersViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVRecipeOrder, seq_query);
}
module.exports.fetchRecipeOrdersViewDataWithCount = fetchRecipeOrdersViewDataWithCount;

const fetchExecutionOrdersViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVExecutionOrder, seq_query);
}
module.exports.fetchExecutionOrdersViewDataWithCount = fetchExecutionOrdersViewDataWithCount;

const fetchExecutionOrderFillsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVExecutionOrderFill, seq_query);
}
module.exports.fetchExecutionOrderFillsViewDataWithCount = fetchExecutionOrderFillsViewDataWithCount;

const fetchRecipeDepositsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVRecipeDeposit, seq_query);
}
module.exports.fetchRecipeDepositsViewDataWithCount = fetchRecipeDepositsViewDataWithCount;

const fetchColdStorageTransferViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVColdStorageTransfer, seq_query);
}
module.exports.fetchColdStorageTransferViewDataWithCount = fetchColdStorageTransferViewDataWithCount;

const fetchColdStorageAccountsViewDataWithCount = async (seq_query = {}) => {

    return fetchViewDataWithCount(AVColdStorageAccount, seq_query);
}
module.exports.fetchColdStorageAccountsViewDataWithCount = fetchColdStorageAccountsViewDataWithCount;

const fetchAssetView = async (asset_id) => {

    return fetchSingleEntity(AVAsset, asset_id)
}
module.exports.fetchAssetView = fetchAssetView;

const fetchInstrumentView = async (instrument_id) => {

    return fetchSingleEntity(AVInstrument, instrument_id)
}
module.exports.fetchInstrumentView = fetchInstrumentView;

const fetchInvestmentRunView = async (investment__id) => {

    return fetchSingleEntity(AVInvestmentRun, investment__id);
}
module.exports.fetchInvestmentRunView = fetchInvestmentRunView;

const fetchRecipeRunView = async (recipe_run_id) => {

    return fetchSingleEntity(AVRecipeRun, recipe_run_id);
}
module.exports.fetchRecipeRunView = fetchRecipeRunView;

const fetchRecipeRunDetailView = async (recipe_run_detail_id) => {

    return fetchSingleEntity(AVRecipeRunDetail, recipe_run_detail_id);
}
module.exports.fetchRecipeRunDetailView = fetchRecipeRunDetailView;

const fetchInstrumentLiquidityRequirementView = async (liquidity_requirement_id) => {

    return fetchSingleEntity(AVInstrumentLiquidityRequirement, liquidity_requirement_id);
}
module.exports.fetchInstrumentLiquidityRequirementView = fetchInstrumentLiquidityRequirementView;

/**
 * Fetch recipe orders group using either an orders group id as first arg or recipe run id as second arg. 
 * 
 * if first arg is supplied, recipe run id is ignored.
 * 
 * Fetching by recipe run id will take latest created recipe orders group
 */
const fetchRecipeOrdersGroupView = async (recipe_orders_group_id, recipe_run_id) => {
    //simpler case, fetch entity by id
    if (_.isNumber(recipe_orders_group_id)) {
        return fetchSingleEntity(AVRecipeOrdersGroup, recipe_orders_group_id/* , alias */);
    }
    //try fetch newest by recipe run id
    if (_.isNumber(recipe_run_id)) {
        const data = await fetchModelData(AVRecipeOrdersGroup, {
            where: {
                recipe_run_id: recipe_run_id
            },
            order: [
                ['created_timestamp', 'DESC']
            ]
        });
        return _.first(data)
    }
    //no numbers supplied - throw error
    TE(`Need to supply numeric recipe orders group id or recipe run id to fetch!`)
}
module.exports.fetchRecipeOrdersGroupView = fetchRecipeOrdersGroupView;

const fetchRecipeOrderView = async (recipe_order_id) => {

    return fetchSingleEntity(AVRecipeOrder, recipe_order_id);
}
module.exports.fetchRecipeOrderView = fetchRecipeOrderView;

const fetchExecutionOrderView = async (execution_order_id) => {

    return fetchSingleEntity(AVExecutionOrder, execution_order_id);
}
module.exports.fetchExecutionOrderView = fetchExecutionOrderView;

const fetchExecutionOrderFillView = async (execution_order_fill_id) => {

    return fetchSingleEntity(AVExecutionOrderFill, execution_order_fill_id);
}
module.exports.fetchExecutionOrderFillView = fetchExecutionOrderFillView;

const fetchRecipeDepositView = async (deposit_id) => {

    return fetchSingleEntity(AVRecipeDeposit, deposit_id);
}
module.exports.fetchRecipeDepositView = fetchRecipeDepositView;

const fetchColdStorageTransferView = async (transfer_id) => {

    return fetchSingleEntity(AVColdStorageTransfer, transfer_id);
}
module.exports.fetchColdStorageTransferView = fetchColdStorageTransferView;

const fetchColdStorageAccountView = async (account_id) => {

    return fetchSingleEntity(AVColdStorageAccount, account_id);
}
module.exports.fetchColdStorageAccountView = fetchColdStorageAccountView;


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

const fetchRoleFooter = async (where_clause = '') => {

    const query = builder.joinQueryParts([
        builder.selectCountDistinct('name', 'names', 'role', where_clause)
    ], [
        'name'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'roles');
}
module.exports.fetchRoleFooter = fetchRoleFooter;

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
          (CASE WHEN status = 'assets.status.401' THEN 1 ELSE 0 END) AS status,
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

const fetchInstrumentExchangesViewFooter = async (where_clause = '') => {

    const query = builder.joinQueryParts([
        builder.selectCountDistinct('exchange_name', 'exchange_names', 'av_instruments_exchanges', where_clause),
        builder.selectCountDistinct('external_instrument', 'external_instruments', 'av_instruments_exchanges', where_clause)
    ], [
        'exchange_id',
        'external_instrument'
    ])

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'table')
}
module.exports.fetchInstrumentExchangesViewFooter = fetchInstrumentExchangesViewFooter;

const fetchLiquidityViewFooter = async (where_clause = '') => {
    // mock data below
    /*let footer = [{
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
    return builder.addFooterLabels(footer, 'liquidity')*/

    const view = 'av_instrument_liquidity_requirements';

    const query = builder.joinQueryParts([
        builder.selectCountDistinct('instrument_id', 'instrument', view, where_clause),
        builder.selectCountDistinct('quote_asset', 'quote_asset', view, where_clause),
    ], [
        'instrument',
        'quote_asset'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'instrument_liquidity_requirements');
}
module.exports.fetchLiquidityViewFooter = fetchLiquidityViewFooter;

const fetchLiquidityExchangesViewFooter = async (where_clause = '') => {
    // mock data below

    /*let footer = [{
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
    ];*/

    const view = 'av_liquidity_requirement_exchanges';

    const query = builder.joinQueryParts([
        builder.selectCountDistinct('exchange_id', 'exchange', view, where_clause),
        builder.selectCountDistinct('instrument_identifier', 'instrument_identifier', view, where_clause),
        builder.selectCount(view, 'passes', builder.addToWhere(where_clause, 'passes = \'liquidity_exchanges.status.lacking\''))
    ], [
        'exchange',
        'instrument_identifier',
        'passes'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'liquidity_exchanges');
}
module.exports.fetchLiquidityExchangesViewFooter = fetchLiquidityExchangesViewFooter;

const fetchInvestmentRunsViewFooter = async (where_clause = '') => {

    const raw_query = `
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

    const view = 'av_investment_runs';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('user_created', 'user_created', view, where_clause),
        builder.selectCountDistinct('strategy_type', 'strategy_type', view, where_clause),
        builder.selectCount(view, 'is_simulated', builder.addToWhere(where_clause, "is_simulated='investment.is_simulated.yes'")),
        builder.selectCount(view, 'status', builder.addToWhere(where_clause, `status='investment.status.${MODEL_CONST.INVESTMENT_RUN_STATUSES.OrdersExecuting}'`))
    ], [
        'id',
        'user_created',
        'strategy_type',
        'is_simulated',
        'status'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'investment_runs');
}
module.exports.fetchInvestmentRunsViewFooter = fetchInvestmentRunsViewFooter;

const fetchRecipeRunsViewFooter = async (where_clause = '') => {

    const raw_query = `
    SELECT
        COUNT(id) AS id,
        COUNT(DISTINCT user_created) as user_created,
        SUM(pending) as approval_status
    FROM
        (SELECT
            id,
            user_created,
            (CASE WHEN approval_status = 41 THEN 1 ELSE 0 END) AS pending
        FROM av_recipe_runs ${builder.whereOrEmpty(where_clause)}) AS inner_av
    `;

    const view = 'av_recipe_runs';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('user_created', 'user_created', view, where_clause),
        builder.selectCount(view, 'approval_status', builder.addToWhere(`approval_status='recipes.status.${MODEL_CONST.RECIPE_RUN_STATUSES.Pending}'`))
    ], [
        'id',
        'user_created',
        'approval_status'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'recipe_runs');
}
module.exports.fetchRecipeRunsViewFooter = fetchRecipeRunsViewFooter;

const fetchRecipeRunDetailsViewFooter = async (where_clause = '') => {

    const raw_query = `
    SELECT
        COUNT(id) AS id,
        COUNT(DISTINCT transaction_asset_id) AS transaction_asset,
        COUNT(DISTINCT quote_asset_id) AS quote_asset,
        COUNT(DISTINCT target_exchange_id) AS target_exchange
    FROM	(SELECT
            id,
            transaction_asset_id,
            quote_asset_id,
            target_exchange_id
        FROM av_recipe_run_details ${builder.whereOrEmpty(where_clause)}) AS inner_av
    `;

    const view = 'av_recipe_run_details';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('transaction_asset_id', 'transaction_asset', view, where_clause),
        builder.selectCountDistinct('quote_asset_id', 'quote_asset', view, where_clause),
        builder.selectCountDistinct('target_exchange_id', 'target_exchange', view, where_clause)
    ], [
        'id',
        'transaction_asset',
        'quote_asset',
        'target_exchange'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'recipe_run_details');
}
module.exports.fetchRecipeRunDetailsViewFooter = fetchRecipeRunDetailsViewFooter;

const fetchRecipeOrdersViewFooter = async (where_clause = '') => {

    const view = 'av_recipe_orders';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('investment_id', 'investment_id', view, where_clause),
        builder.selectCountDistinct('instrument_id', 'instrument', view, where_clause),
        builder.selectCountDistinct('target_exchange_id', 'exchange', view, where_clause),
        builder.selectCount(view, 'status', builder.addToWhere(where_clause, `status='orders.status.${MODEL_CONST.RECIPE_ORDER_STATUSES.Pending}'`))
    ], [
        'id',
        'investment_id',
        'instrument',
        'exchange',
        'status'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'recipe_orders');

}
module.exports.fetchRecipeOrdersViewFooter = fetchRecipeOrdersViewFooter;

const fetchExecutionOrdersViewFooter = async (where_clause = '') => {

    const view = 'av_execution_orders';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('instrument_id', 'instrument', view, where_clause),
        builder.selectCountDistinct('exchange_id', 'exchange', view, where_clause),
        builder.selectCount(view, 'status', builder.addToWhere(where_clause, `status='execution_orders.status.${MODEL_CONST.EXECUTION_ORDER_STATUSES.Pending}'`))
    ], [
        'id',
        'instrument',
        'exchange',
        'status'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'execution_orders');

}
module.exports.fetchExecutionOrdersViewFooter = fetchExecutionOrdersViewFooter;

const fetchExecutionOrderFillsViewsFooter = async (where_clause = '') => {

    const view = 'av_execution_order_fills';

    const query = builder.joinQueryParts([
        builder.selectCountDistinct('id', 'id', view, where_clause),
        builder.selectSumTrim('fill_price', view, where_clause),
        builder.selectSum('quantity', view, where_clause)
    ], [
        'id',
        'fill_price',
        'quantity'
    ])

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'execution_order_fills'
    )
}
module.exports.fetchExecutionOrderFillsViewsFooter = fetchExecutionOrderFillsViewsFooter;

const fetchRecipeDepositsViewsFooter = async (where_clause = '') => {

    const view = 'av_recipe_deposits';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('investment_run_id', 'investment_run_id', view, where_clause),
        builder.selectCountDistinct('quote_asset_id', 'quote_asset', view, where_clause),
        builder.selectCountDistinct('exchange_id', 'exchange', view, where_clause),
        builder.selectCountDistinct('account', 'account', view, where_clause),
        builder.selectSum('investment_percentage', view, where_clause),
        builder.selectCount(view, 'status', builder.addToWhere(where_clause, `status='deposits.status.${MODEL_CONST.RECIPE_RUN_DEPOSIT_STATUSES.Pending}'`))
    ], [
        'id',
        'investment_run_id',
        'quote_asset',
        'exchange',
        'account',
        'investment_percentage',
        'status'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'deposits'
    )
}
module.exports.fetchRecipeDepositsViewsFooter = fetchRecipeDepositsViewsFooter;

const fetchColdStorageTransfersViewsFooter = async (where_clause = '') => {

    const view = 'av_cold_storage_transfers';

    const query = builder.joinQueryParts([
        builder.selectCount(view, 'id', where_clause),
        builder.selectCountDistinct('asset_id', 'asset', view, where_clause),
        builder.selectCount(view, 'status', builder.addToWhere(where_clause, `status='cold_storage_transfers.status.${MODEL_CONST.COLD_STORAGE_ORDER_STATUSES.Pending}'`)),
        builder.selectCountDistinct('source_exchange', 'source_exchange', view, where_clause),
    ], [
        'id',
        'asset',
        'status',
        'source_exchange'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'cold_storage_transfers'
    )
}
module.exports.fetchColdStorageTransfersViewsFooter = fetchColdStorageTransfersViewsFooter;

const fetchColdStorageAccountsViewsFooter = async (where_clause = '') => {

    const view = 'av_cold_storage_accounts';

    const query = builder.joinQueryParts([
        builder.selectSumTrim('balance_usd', view, where_clause),
    ], [
        'balance_usd'
    ]);

    const footer = (await sequelize.query(query))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer), 'cold_storage_transfers'
    )
}
module.exports.fetchColdStorageAccountsViewsFooter = fetchColdStorageAccountsViewsFooter;