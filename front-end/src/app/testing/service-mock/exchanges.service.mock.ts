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
    }
  ],
  count: 2
};
