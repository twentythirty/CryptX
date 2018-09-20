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
