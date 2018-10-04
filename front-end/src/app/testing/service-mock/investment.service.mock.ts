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


