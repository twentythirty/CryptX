'use strict';

const mu = require('../utils/MigrationUtil');

module.exports = mu.migration_for_settings(
    [
        'BASE_ASSET_PRICE_TTL_THRESHOLD'
    ],
    [
        SETTING_DATA_TYPES.Integer
    ]
)
