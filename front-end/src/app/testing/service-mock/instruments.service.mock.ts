import { InstrumentsAllResponse } from '../../services/instruments/instruments.service';
import { Instrument } from '../../shared/models/instrument';

export const getAllInstrumentsData: InstrumentsAllResponse = {
    success: true,
    instruments: [
        new Instrument ({
            id: 1,
            symbol: 'BTC/GLC',
            exchanges_connected: '0',
            exchanges_failed: '0'
        })],
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
