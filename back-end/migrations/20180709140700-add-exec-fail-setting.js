'use strict';

const mu = require('../utils/MigrationUtil');

module.exports = mu.migration_for_settings(
    [
        'EXEC_ORD_FAIL_TOLERANCE'
    ], 
    [
        SETTING_DATA_TYPES.Integer
    ]
)