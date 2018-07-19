export class Instrument {
    public id: number;
    public transaction_asset_id: number;
    public quote_asset_id: number;
    public symbol: string;

    public exchanges_connected?: number;
    public exchanges_failed?: number;
}