'use strict';


const sequelize = require('../models').sequelize;
const builder = require('../utils/AdminViewUtils');

const fetchUsersViewFooter = async (where_clause = '') => {

    const simple_fields = {
        first_name: 'first_name',
        last_name: 'last_name',
        email: 'email', 
        created_timestamp: 'created_timestamp::date'
    }

    const query_parts = _.concat(_.map(simple_fields, (field_expr, alias) => {
        //using public.user, since pg has a default user table and its very different
        return builder.selectCountDistinct(field_expr, alias, 'public.user', where_clause)
    }), 
    //attach the more fancy footer column query as-is to avoid convoluted parametrization
    `(SELECT COALESCE(SUM(a), 0)
    FROM
      (SELECT CASE WHEN is_active THEN 1 ELSE 0 END as a
       FROM public.USER
       ${_.isEmpty(where_clause)? '' : `WHERE ${where_clause}`}) AS active_users) AS is_active`)

    const footer_values = (await sequelize.query(`SELECT\n${_.join(query_parts, ',\n')};`))[0];

    return builder.addFooterLabels(
        builder.queryReturnRowToFooterObj(footer_values), 'users');
}
module.exports.fetchUsersViewFooter = fetchUsersViewFooter;


const fetchAssetsViewFooter = async () => {

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