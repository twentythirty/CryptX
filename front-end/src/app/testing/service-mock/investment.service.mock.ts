export const getAllInvestmentsData = {
  success: true,
  investment_runs: [
    {
      completed_timestamp: null,
      deposit_usd: '0',
      id: 137,
      is_simulated: 'investment.is_simulated.yes',
      started_timestamp: 1538123482803,
      status: 'investment.status.302',
      strategy_type: 'investment.strategy.101',
      updated_timestamp: 1538123491226,
      user_created: 'Admin ',
      user_created_id: 1,
    }
  ],
  count: 1,
  footer: []
};

export const getTimelineData = {
  timeline: {
    investment_run: {
      id: 155,
      started_timestamp: 1538630845461,
      updated_timestamp: 1538630993430,
      completed_timestamp: null,
      strategy_type: 'investment.strategy.101',
      is_simulated: true,
      status: 'investment.status.302',
      deposit_usd: '0',
      user_created_id: 3,
      investment_run_asset_group_id: 187
    },
    recipe_run: {
      id: 210,
      created_timestamp: 1538630980595,
      approval_status: 'recipes.status.42',
      approval_timestamp: 1538634240146,
      approval_comment: 'NO',
      investment_run_id: 155,
      user_created_id: 3,
      approval_user_id: 3
    },
    recipe_deposits: null,
    recipe_orders: null,
    execution_orders: null
  },
  success: true,
};

export const getSingleRecipeData = {
  success: true,
  recipe_run: {
    approval_comment: 'testing',
    approval_status: 'recipes.status.43',
    approval_timestamp: '2018-08-06T10:41:11.364Z',
    approval_user: 'Admin ',
    approval_user_id: 1,
    created_timestamp: '2018-08-02T07:33:55.248Z',
    id: 7,
    investment_run_id: 7,
    user_created: 'Test User',
    user_created_id: 3
  }
};

export const getAllRecipeOrdersData = {
  success: true,
  recipe_orders: [
    {
      completed_timestamp: null,
      created_timestamp: 1533199144899,
      exchange: 'Bittrex',
      id: 5,
      instrument: 'LTC/ETH',
      instrument_id: 4,
      investment_id: 7,
      price: '1.52',
      quantity: '33',
      recipe_order_group_id: 2,
      recipe_run_id: 7,
      side: 'orders.side.999',
      status: 'orders.status.53',
      sum_of_exchange_trading_fee: '0',
      target_exchange_id: 4
    }
  ],
  footer: [],
  count: 1
};

export const getDepositAmountsData = {
  success: true,
  footer: [],
  deposit_amounts: [
    {
      amount: '123456',
      currency_name: 'US Dollars',
      currency_symbol: 'USD',
      id: 207,
      investment_run_id: 155,
      value_usd: '123456'
    }
  ]
};

export const getAllRecipesData = {
  count: 1,
  footer: [],
  success: true,
  recipe_runs: [
    {
      approval_comment: 'NO',
      approval_status: 'recipes.status.42',
      approval_timestamp: 1538634240146,
      approval_user: 'Test User',
      approval_user_id: 3,
      created_timestamp: 1538630980595,
      id: 210,
      investment_run_id: 155,
      user_created: 'Test User',
      user_created_id: 3
    }
  ]
};

export const getSingleInvestmentData = {
  asset_mix: [
    {
      capitalization: '150193862',
      comment: null,
      id: 1536,
      long_name: 'Holo',
      market_share: '0.0688582945596126',
      nvt_ratio: '32.1169106386237957',
      status: 'assets.status.400',
      symbol: 'HOT'
    }
  ],
  count: 1,
  footer: [],
  success: true,
  investment_run: {
    completed_timestamp: null,
    deposit_usd: '0',
    id: 155,
    is_simulated: 'investment.is_simulated.yes',
    started_timestamp: 1538630845461,
    status: 'investment.status.302',
    strategy_type: 'investment.strategy.101',
    updated_timestamp: 1538630993430,
    user_created: 'Test User',
    user_created_id: 3
  }
};

export const createRecipeRunResponse = {
  success: true,
  recipe_run: {
    id: 10,
    created_timestamp: 1525424340810,
    investment_run_id: 10,
    user_created_id: 4,
    approval_status: 41,
    approval_timestamp: 1525424340810,
    approval_comment: 'I approve this recipe run because...',
    approval_user_id: 6
  }
};

