'use strict';


const sequelize = require('../models').sequelize;
const builder = require('../utils/AdminViewUtils');
const AVUser = require('../models').AVUser;

const TABLE_LOV_FIELDS = {
    'av_users': [
        'first_name', 
        'last_name',
        'email',
        'is_active'
    ]
}


const fetchViewHeaderLOV = async (table, field, query) => {

    const allowed_fields = TABLE_LOV_FIELDS[table];

    if (allowed_fields == null || !allowed_fields.includes(field)) {
        return [];
    }

    const sql = builder.selectDistinct(field, table, query? `${field} LIKE ${sequelize.escape(`%${query}%`)}`: '')
    
    //returns list of objects with 1 key-value pair, key being field name
    const values = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

    //extrac field values from key value pairs
    return _.map(values, field);
}
const fetchViewDataWithCount = async (model, seq_where = {}) => {

    const [data, total] = await Promise.all([
        model.findAll(seq_where),
        model.count()
    ]);
    
    return { data, total }
}


const fetchUsersViewHeaderLOV = async (header_field, query = '') => {

    return fetchViewHeaderLOV('av_users', header_field, query)
}
module.exports.fetchUsersViewHeaderLOV = fetchUsersViewHeaderLOV;

const fetchUsersViewDataWithCount = async (seq_where = {}) => {

    return fetchViewDataWithCount(AVUser, seq_where);
}
module.exports.fetchUsersViewDataWithCount = fetchUsersViewDataWithCount;

const fetchUsersViewFooter = async (where_clause = '') => {

    const simple_fields = {
        first_name: 'first_name',
        last_name: 'last_name',
        email: 'email', 
        created_timestamp: 'created_timestamp::date'
    }

    const query_parts = _.concat(_.map(simple_fields, (field_expr, alias) => {
        //using public.user, since pg has a default user table and its very different
        return builder.selectCountDistinct(field_expr, alias, 'av_users', where_clause)
    }), 
    //attach the more fancy footer column query as-is to avoid convoluted parametrization
    `(${builder.selectCount('av_users', 'is_active', 'is_active = \'users.entity.active\'')})`);

    const footer_values = (await sequelize.query(`SELECT\n${_.join(query_parts, ',\n')};`))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer_values), 'users');
}
module.exports.fetchUsersViewFooter = fetchUsersViewFooter;


const fetchMockHeaderLOV = async (header_field, query = '') => {
    // mock data below
    return [ 'Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];
}
module.exports.fetchMockHeaderLOV = fetchMockHeaderLOV;

const fetchAssetsViewFooter = async () => {
    // mock data below
    let mock_data = [
        {
            "name": "symbol",
            "value": 999,
        },
        {
            "name": "long_name",
            "value": 999
        },
        {
            "name": "is_base",
            "value": 999
        },
        {
            "name": "is_deposit",
            "value": 999
        },
        {
            "name": "capitalization",
            "value": 9999999
        },
        {
            "name": "capitalization_updated",
            "value": 999
        },
        {
            "name": "status",
            "value": 999
        }
    ];

    return builder.addFooterLabels(mock_data, 'assets', {
        capitalization: (cap) => `$${cap}`
    });
}
module.exports.fetchAssetsViewFooter = fetchAssetsViewFooter;

const fetchInstrumentsViewFooter = async () => {
    // mock data below
    let footer = [
        {
          "name": "id",
          "value": "999"
        },
        {
          "name": "transaction_asset_id",
          "value": "999"
        },
        {
          "name": "quote_asset_id",
          "value": "999"
        },
        {
          "name": "symbol",
          "value": "999"
        },
        {
          "name": "exchanges_connected",
          "value": "999"
        },
        {
          "name": "exchanges_failed",
          "value": "999"
        }
      ];

      return builder.addFooterLabels(footer, 'instruments')
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
      let footer = [
        {
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

    let footer = [
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

      return builder.addFooterLabels(footer, 'liquidity_exchanges')
}
module.exports.fetchLiquidityExchangesViewFooter = fetchLiquidityExchangesViewFooter;