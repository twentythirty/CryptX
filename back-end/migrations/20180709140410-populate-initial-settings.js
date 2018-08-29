'use strict';

const mu = require('../utils/MigrationUtil');

module.exports = mu.migration_for_settings(
    [
        'MARKETCAP_LIMIT_PERCENT',
        'INDEX_LCI_CAP',
        'INDEX_MCI_CAP',
        'BASE_BTC_TRADE',
        'BASE_ETH_TRADE',
        'TRADE_BASE_FUZYNESS'
    ], 
    [
        SETTING_DATA_TYPES.Float,
        SETTING_DATA_TYPES.Integer,
        SETTING_DATA_TYPES.Integer,
        SETTING_DATA_TYPES.Float,
        SETTING_DATA_TYPES.Float,
        SETTING_DATA_TYPES.Float
    ]
)