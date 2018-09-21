export class LiquidityRequirement {
    public id: number;
    public instrument_id?: number;
    public instrument: string;
    public minimum_circulation: string | number;
    public periodicity: number;
    public quote_asset: string;
    public exchange: string;
    public exchange_count: number | string;
    public exchange_pass: number | string;
    public exchange_not_pass: number | string;

    constructor(data: LiquidityRequirement) {
        Object.assign(this, data);
    }
}
