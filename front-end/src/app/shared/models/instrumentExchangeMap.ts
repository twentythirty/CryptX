export class InstrumentExchangeMap {
    public instrument_id: number;
    public exchange_id: number | '' = '';
    public external_instrument: string;
    public external_instrument_id: string; // external_instrument and external_instrument_id is the same data
    public current_price: number;
    public last_day_vol: number;
    public last_week_vol: number;
    public last_updated: number;

    public valid?: boolean = false;
}
