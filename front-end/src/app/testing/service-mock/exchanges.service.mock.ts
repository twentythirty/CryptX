import { ExchangesAllResponse, CredentialFieldsResponse, ExchangeCredentialsResponse } from '../../services/exchanges/exchanges.service';
import { ExchangeAccount } from '../../shared/models/exchangeAccount';

export const getAllExchangesData: ExchangesAllResponse = {
  success: true,
  exchanges: [
    {
      id: 1,
      name: 'Binance'
    },
    {
      id: 2,
      name: 'Bitfinex'
    },
    {
      id: 3,
      name: 'Test value3'
    },
    {
      id: 4,
      name: 'Test value4'
    }
  ],
  count: 4
};

export const getExchangeInstrumentIdentifiersData = {
  success: true,
  identifiers: ['ADA/BNB', 'ADA/BTC', 'ADA/ETH', 'ADA/USDT']
};

export const getAllExchangeAccountsData = {
  success: true,
  count: 1,
  footer: [],
  exchange_accounts: [
    new ExchangeAccount({
      id: 1,
      asset_id: 10,
      asset: 'BTC',
      exchange_id: 2,
      exchange: 'Biffinex',
      address: 'test',
      is_active: 'exchange_accounts.is_active.active'
    }),
  ]
};

export const getAllExchangeCredentialsData = {
    success: true,
    count: 1,
    footer: [],
    exchange_credentials: [
      {
        id: 18,
        exchange_id: 354,
        exchange: 'Binance',
        api_key: 'SuperBinanceUser64'
      }
    ]
};

export const getSingleExchangeAccountsData = {
  success: true,
  exchange_account: {
    address: 'test',
    asset: 'USD',
    asset_id: 1,
    exchange: 'OKEx',
    exchange_id: 2,
    id: 1,
    is_active: 'exchange_accounts.is_active.active'
  }
};

export const createExchangeAccountData = {
  success: true,
  exchange_account: {
    id: 18,
    asset_id: 2,
    account_type: 401,
    is_active: true
  }
};

export const getCredentialFieldsData: CredentialFieldsResponse = {
  success: true,
  fields: [
    {
      title: 'exchange_credentials.fields.api_key',
      field_name: 'api_key',
      type: 'string'
    },
    {
      title: 'exchange_credentials.fields.api_secret',
      field_name: 'api_secret',
      type: 'string'
    },
    {
      title: 'exchange_credentials.fields.password',
      field_name: 'password',
      type: 'string'
    },
    {
      title: 'exchange_credentials.fields.passphrase',
      field_name: 'passphrase',
      type: 'string'
    }
  ]
};

export const getExchangeCredentialsData: ExchangeCredentialsResponse = {
  success: true,
  exchange_credential: {
    id: 9,
    exchange_id: 8,
    exchange: 'OKEx',
    api_key: 'someApiKey'
  }
};

export const setExchangeCredentialsData = {
  success: true,
  message: 'ok!'
};

export const deleteExchangeCredentialsData = {
  success: true,
  message: 'ok!'
};
