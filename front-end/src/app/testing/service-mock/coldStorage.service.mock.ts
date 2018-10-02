import { CustodiansAllResponse, AddAccountResponse, AccountsAllResponse } from '../../services/cold-storage/cold-storage.service';

export const getAllCustodiansData: CustodiansAllResponse = {
  success: true,
  custodians: [
    {
      id: 7,
      name: 'New Custodian 2'
    }
  ],
  footer: [],
  count: 1
};

export const addAccountData: AddAccountResponse = {
  success: true,
  account: {}
};

export const getAllAccountsData: AccountsAllResponse = {
  success: true,
  accounts: [
    {
      address: 'addressgoeshere',
      asset: 'PPC',
      balance: '0',
      balance_update_timestamp: null,
      balance_usd: '0',
      custodian: 'New Custodian 2',
      id: 17,
      strategy_type: 'investment.strategy.102'
    }
  ],
  footer: [],
  count: 1,
};

