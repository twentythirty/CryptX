import { InstrumentsAllResponse, InstrumentsGetResponse, CheckMappingResponse } from '../../services/instruments/instruments.service';
import { Instrument } from '../../shared/models/instrument';

export const getAllInstrumentsData: InstrumentsAllResponse = {
  success: true,
  instruments: [
    new Instrument({
      id: 1,
      symbol: 'BTC/GLC',
      exchanges_connected: '0',
      exchanges_failed: '0'
    })
  ],
  footer: [],
  count: 1
};

export const createInstrumentData = {
  success: true,
  instrument: {
    id: 3927,
    transaction_asset_id: 4,
    quote_asset_id: 6,
    symbol: 'NMC/PPC'
  }
};

export const getInstrumentData: InstrumentsGetResponse = {
  success: true,
  instrument: new Instrument({
    id: 3888,
    symbol: 'BCD/ETH',
    exchanges_connected: '1',
    exchanges_failed: '0'
  })
};

export const getInstrumentExchangesMappingData = {
  success: true,
  mapping_data: [
    {
      instrument_id: 3894,
      exchange_id: 1,
      exchange_name: 'Binance',
      external_instrument: 'ETH/BTC',
      current_price: '0.014147',
      last_day_vol: '40949.66',
      last_week_vol: '381250.33',
      last_updated: 1537525272743
    }
  ],
  footer: [],
  count: 1
};

export const checkMappingData = {
  success: true,
  mapping_status: true
};

export const addMappingData = {
  success: true
};
