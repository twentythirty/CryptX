export class InstrumentExchangeMap {
    public instrument_id: number;
    public exchange_id: number | '' = null;
    public external_instrument: string;
    public external_instrument_id: string; // external_instrument and external_instrument_id is the same data
    /**
     * @param external_instrument_list - List of possible external_instrument's
     */
    public external_instrument_list: Array<string>;
    public current_price: number;
    public last_day_vol: number;
    public last_week_vol: number;
    public last_updated: number;

    public valid?: boolean = false;
    public isDeleted?: boolean = false;
    public isNew?: boolean = true;
}
