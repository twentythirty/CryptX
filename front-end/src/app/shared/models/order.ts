export class Order {
    public id?: number;
    public instrument: string;
    public instrument_id: number;
    public investment_id: number;
    public price: string;
    public quantity: string;
    public recipe_order_group_id: number;
    public recipe_run_id: number;
    public side: string;
    public status: string;
    public sum_of_exhange_trading_fee: string;
    public target_exchange_id: number;
    public created_timestamp: string;
    public completed_timestamp: string;
    public exchange: string;
}