'use strict';

const mu = require('../utils/MigrationUtil');

module.exports = mu.migration_for_settings(
    [
        'MARKET_DATA_TTL_HANDICAP'
    ],
    [
        SETTING_DATA_TYPES.Integer
    ]
)
