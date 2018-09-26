import { ExchangesAllResponse } from '../../services/exchanges/exchanges.service';

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
