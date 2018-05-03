//constants for data not directly associated with permissions


MAX_COINS = 523 //max amount of coins pulled from marketcap source to put into DB

STRATEGY_TYPES = {
  MCI: "Mid Cap Index",
  LCI: "Large Cap Index"
};

INVESTMENT_RUN_STATUSES = [
  "Initiated",
  "RecipeRun",
  "RecipeApproved",
  "DepositsCompleted",
  "OrdersGenerated",
  "OrdersApproved",
  "OrdersExecuting",
  "OrdersFilled"
];

RECIPE_RUN_STATUSES = ["New", "Rejected", "Approved"];

RECIPE_ORDER_STATUSES = ["New", "Rejected", "Approved"];

EXECUTION_ORDER_STATUSES = [
  "Pending",
  "Placed",
  "FullyFilled",
  "PartiallyFilled",
  "Cancelled",
  "Failed"
];

EXECUTION_ORDER_TYPES = ["Market", "Limit", "Stop"];

COLD_STORAGE_TRANSFER_STATUSES = {
  Pending: "order was enum generated internally, but notyet sent",
  Sent: "order wassent to exchange or blockchain (waiting confirmation)",
  Completed: "when order reaches its final successful state",
  Failed: "system failed to execute the order"
};
