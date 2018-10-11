export const SubmitData = {
  success: true,
  deposit: {
    amount: 44,
    asset_id: 312,
    completion_timestamp: null,
    creation_timestamp: 1539079467405,
    deposit_management_fee: 44,
    depositor_user_id: null,
    id: 143,
    recipe_run_id: 165,
    status: 'deposits.status.150',
    target_exchange_account_id: 4
  }
};

export const ApproveData = {
  success: true,
  deposit: {
    amount: '44',
    asset_id: 312,
    completion_timestamp: 1539159576580,
    creation_timestamp: 1539079467405,
    deposit_management_fee: '44',
    depositor_user: 'Test User',
    depositor_user_id: 1,
    id: 143,
    recipe_run_id: 165,
    status: 'deposits.status.151',
    target_exchange_account_id: 4
  }
};

export const getDepositData = {
  success: true,
  recipe_deposit: {
    id: 1,
    recipe_run_id: 67,
    investment_run_id: 38,
    quote_asset_id: 312,
    quote_asset: 'ETH',
    exchange_id: 7,
    exchange: 'Huobi',
    account: '0xbb21d3b9806b4b5d654e13cba283e1f37b35028b',
    amount: '10',
    investment_percentage: '11.111111111111110',
    deposit_management_fee: '1',
    depositor_user: 'Test User',
    status: 'deposits.status.150'
  },
  action_logs: [
    {
      id: 156871,
      timestamp: 1535519306322,
      level: 1,
      translationKey: 'logs.universal.modified_user',
      translationArgs: {
        user_name: 'Test User',
        column: 'Status',
        prev_value: '{deposits.status.150}',
        new_value: '{deposits.status.150}'
      }
    },
  ]
};

export const getAllDepositsData = {
  success: true,
  recipe_deposits: [
    {
      id: 1,
      account: '0xbb21d3b9806b4b5d654e13cba283e1f37b35028b',
      amount: '44',
      deposit_management_fee: '44',
      depositor_user: 'Test User',
      exchange: 'Huobi',
      exchange_id: 7,
      investment_percentage: '5.2631578947368421053',
      investment_run_id: 127,
      quote_asset: 'ETH',
      quote_asset_id: 312,
      recipe_run_id: 165,
      status: 'deposits.status.150'
    }
  ],
  count: 1,
  footer: [
    {
      name: 'id',
      template: 'deposits.footer.id',
      value: '1',
      args: { id: '1' }
    }
  ]
};

export const getHeaderLOVData = [
  { value: 'value 1' },
  { value: 'value 2' },
  { value: 'value 3' }
];
