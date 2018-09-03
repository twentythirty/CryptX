export class LiquidityRequirement {
    public id: number;
    public instrument_id?: number;
    public instrument: string;
    public minimum_circulation: number | string;
    public periodicity: number;
    public quote_asset: string;
    public exchange: string;
    public exchange_count: number | string;
    public exchange_pass: number | string;
    public exchange_not_pass: number | string;
}
