import permissions from '../../config/permissions';

export const authenticateData = {
  success: true,
  user: {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@donain.com',
    created_timestamp: 1526975256757,
    reset_password_token_hash: null,
    reset_password_token_expiry_timestamp: null,
    is_active: true
  },
  validators: {
    // deprecated, we sould not use this
  },
  model_constants: {
    BUILD_RESULTS_STATUSES: {
      PASSED: 8080,
      FAILED: 8005
    },
    LOG_LEVEL: {
      TRACE: 1,
      DEBUG: 2,
      INFO: 3,
      WARN: 4,
      ERROR: 5
    },
    ACTIONLOG_LEVELS: {
      Debug: 0,
      Info: 1,
      Warning: 2,
      Error: 3
    },
    STRATEGY_TYPES: {
      MCI: 101,
      LCI: 102
    },
    INSTRUMENT_STATUS_CHANGES: {
      Whitelisting: 400,
      Blacklisting: 401,
      Graylisting: 402
    },
    MARKET_HISTORY_CALCULATION_TYPES: {
      NVT: 0
    },
    INVESTMENT_RUN_STATUSES: {
      Initiated: 301,
      RecipeRun: 302,
      RecipeApproved: 303,
      DepositsCompleted: 304,
      OrdersGenerated: 305,
      OrdersApproved: 306,
      OrdersExecuting: 307,
      OrdersFilled: 308
    },
    EXCHANGE_ACCOUNT_TYPES: {
      Trading: 201,
      Withdrawal: 202
    },
    RECIPE_RUN_DEPOSIT_STATUSES: {
      Pending: 150,
      Completed: 151
    },
    RECIPE_RUN_STATUSES: {
      Pending: 41,
      Rejected: 42,
      Approved: 43
    },
    RECIPE_ORDER_GROUP_STATUSES: {
      Pending: 81,
      Rejected: 82,
      Approved: 83
    },
    RECIPE_ORDER_STATUSES: {
      Pending: 51,
      Executing: 52,
      Completed: 53,
      Rejected: 54,
      Cancelled: 55,
      Failed: 56
    },
    EXECUTION_ORDER_STATUSES: {
      Pending: 61,
      InProgress: 62,
      FullyFilled: 63,
      PartiallyFilled: 64,
      Cancelled: 65,
      Failed: 66,
      NotFilled: 67
    },
    EXECUTION_ORDER_TYPES: {
      Market: 71,
      Limit: 72,
      Stop: 73
    },
    ORDER_SIDES: {
      Buy: 999,
      Sell: 888
    },
    COLD_STORAGE_ORDER_STATUSES: {
      Pending: 91,
      Approved: 92,
      Sent: 93,
      Completed: 94,
      Failed: 95
    },
    CUSTODIANS: {
    },
    SETTING_DATA_TYPES: {
      Integer: 130,
      Float: 131,
      String: 132,
      Boolean: 133
    },
    JOB_RESULT_STATUSES: {
      Error: 'error',
      Skipped: 'skipped'
    },
    ASSET_CONVERSION_STATUSES: {
      Pending: 501,
      Completed: 502
    }
  },
  permissions: Object.values(permissions)
};

export const requestPasswordResetData = {
  success: true,
  message: 'success message'
};

export const changeInfoData =  {
  success: true,
  user: {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@domain.com',
    created_timestamp: 1536926502164,
    reset_password_token_hash: null,
    reset_password_token_expiry_timestamp: null,
    is_active: true
  }
};

export const checkResetTokenValidityData =  {
  success: true,
  message: 'success message'
};

export const resetPasswordData = {
  new_password: 'some_new_secure_password'
};
