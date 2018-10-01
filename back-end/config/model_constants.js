//constants for data not directly associated with permissions

MODEL_CONST = {

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
    MCI: 101, //mid cap index
    LCI: 102 //large cap index
  },

  INSTRUMENT_STATUS_CHANGES: {
    Whitelisting: 400,
    Blacklisting: 401,
    Graylisting: 402
  },

  MARKET_HISTORY_CALCULATION_TYPES: {
    NVT: 0 //Network Value to Transactions ratio, measures the dollar value of cryptoasset transaction activity relative to network value
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
    Rejected: 54, // (by the user)
    Cancelled: 55, // (manual intervention by user)
    Failed: 56 // (due to technical issue which does not allow to continue)
  },

  EXECUTION_ORDER_STATUSES: {
    Pending: 61, // not yet sent to the exchange
    InProgress: 62, // an order that is on the exchange already, but has not been fully filled. It might be not filled at all yet, or filled partially
    FullyFilled: 63, // order that has been successfully filled (fully)
    PartiallyFilled: 64, // terminal state for orders that have been ended before they could be filled fully, but part of them was filled
    /* Cancelled: 65, // not used*/
    Failed: 66, // terminal state for orders that was placed on the exchange, but could not get a fill at all and was terminated/expired
    NotFilled: 67 // order for which sending to the exchange has failed
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
    Pending: 91, //"order was generated internally, but not yet sent",
    Approved: 92, //"order was approved by a user",
    Sent: 93, //"order wassent to exchange or blockchain (waiting confirmation)",
    Completed: 94, //"when order reaches its final successful state",
    Failed: 95 //"system failed to execute the order"
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
};


/* Earlier we didn't use a single global variable MODEL_CONST that wraps properties, but
 * separate global variables for those values. Now that we need to export them, they
 * are wrapped in single global object and old global variables are defined here to
 * not break application */
Object.keys(MODEL_CONST).map(key => {
  global[key] = MODEL_CONST[key];
});

module.exports = MODEL_CONST;