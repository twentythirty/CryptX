import { CustodiansAllResponse,
         AddAccountResponse,
         AccountsAllResponse,
         TransfersAllResponse,
         TransferResponse,
         AddCustodianResponse} from '../../services/cold-storage/cold-storage.service';
import { Transfer } from '../../shared/models/transfer';

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

export const getAllTransfersData: TransfersAllResponse = {
  footer: [],
  count: 1,
  success: true,
  transfers: [
    new Transfer ({
      asset: 'BTC',
      asset_id: 2,
      completed_timestamp: null,
      custodian: 'Coinbase Custody',
      destination_account: '1234',
      exchange_withdrawal_fee: '0.0001',
      gross_amount: '1.1',
      id: 9,
      net_amount: '1.0999',
      placed_timestamp: 1535004629647,
      source_account: '1GDff323q4RGghgLVTi9xeqSkyzRjRrK2',
      source_exchange: 'Binance',
      status: 'cold_storage_transfers.status.92',
      strategy_type: 'investment.strategy.102'
    })
  ]
};

export const getTransferData: TransferResponse = {
  success: true,
  transfer: new Transfer ({
    asset: 'BTC',
    asset_id: 2,
    completed_timestamp: null,
    custodian: 'Coinbase Custody',
    destination_account: '1234',
    exchange_withdrawal_fee: '0.0001',
    gross_amount: '1.1',
    id: 9,
    net_amount: '1.0999',
    placed_timestamp: 1535004629647,
    source_account: '1GDff323q4RGghgLVTi9xeqSkyzRjRrK2',
    source_exchange: 'Binance',
    status: 'cold_storage_transfers.status.92',
    strategy_type: 'investment.strategy.102'
  }),
  action_logs: [
    {
      id: 1393494,
      timestamp: 1543489370223,
      level: 1,
      performing_user_id: 3,
      user_session_id: 1344,
      cold_storage_transfer_id: 23,
      translationKey: 'logs.universal.modified_user',
      translationArgs: {
        user_name: 'John Doe',
        column: 'Status',
        prev_value: 'cold_storage.transfers.status.91',
        new_value: 'cold_storage.transfers.status.92'
      }
    }
  ]
};

export const addCustodianData: AddCustodianResponse = {
  success: true,
  custodian: {}
};

export const confirmTransferData = {
  success: true,
  transfers: [
    new Transfer ({
      asset: 'BTC',
      asset_id: 2,
      completed_timestamp: 1532097313472,
      custodian: 'Coinbase Custody',
      destination_account: '1234',
      exchange_withdrawal_fee: '0.0001',
      gross_amount: '1.1',
      id: 9,
      net_amount: '1.0999',
      placed_timestamp: 1535004629647,
      source_account: '1GDff323q4RGghgLVTi9xeqSkyzRjRrK2',
      source_exchange: 'Binance',
      status: 'cold_storage_transfers.status.94',
      strategy_type: 'investment.strategy.102'
    })
  ],
  footer: [],
  count: 1
};
