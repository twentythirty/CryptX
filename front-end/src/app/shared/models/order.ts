export class Order {
  public id?: number;
  public instrument_id: number;
  public instrument: string;
  public side: string;
  public exchange: string;
  public price: string;
  public status: string;
  public created_timestamp: number;
  public completed_timestamp: number;
  public investment_id: number;
  public quantity: string;
  public recipe_order_group_id: number;
  public recipe_run_id: number;
  public sum_of_exchange_trading_fee: string;
  public target_exchange_id: number;

  constructor(data: Order) {
    Object.assign(this, data);
  }
}
