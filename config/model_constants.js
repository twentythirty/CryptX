//constants for data not directly associated with permissions

STRATEGY_TYPES = {
  MCI: 101, //mid cap index
  LCI: 102 //large cap index
};

INVESTMENT_RUN_STATUSES = {
  Initiated: 301,
  RecipeRun: 302,
  RecipeApproved: 303,
  DepositsCompleted: 304,
  OrdersGenerated: 305,
  OrdersApproved: 306,
  OrdersExecuting: 307,
  OrdersFilled: 308
};

EXCHANGE_ACCOUNT_TYPES = {
  Trading: 201,
  Withdrawal: 202
};

RECIPE_RUN_STATUSES = {
  New: 41,
  Rejected: 42,
  Approved: 43
};

RECIPE_ORDER_STATUSES = {
  New: 81,
  Rejected: 82,
  Approved: 83
};

EXECUTION_ORDER_STATUSES = {
  Pending: 61,
  Placed: 62,
  FullyFilled: 63,
  PartiallyFilled: 64,
  Cancelled: 65,
  Failed: 66
};

EXECUTION_ORDER_TYPES = {
  Market: 71,
  Limit: 72,
  Stop: 73
};

COLD_STORAGE_TRANSFER_STATUSES = {
  Pending: 51, //"order was generated internally, but not yet sent",
  Sent: 52, //"order wassent to exchange or blockchain (waiting confirmation)",
  Completed: 53, //"when order reaches its final successful state",
  Failed: 54 //"system failed to execute the order"
};