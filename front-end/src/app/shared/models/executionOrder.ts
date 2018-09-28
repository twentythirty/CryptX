export class ExecutionOrder {
  public id: number;
  public investment_run_id: number;
  public recipe_order_id: number;
  public instrument_id: number;
  public instrument: string;
  public side: string;
  public exchange_id: number;
  public exchange: string;
  public type: string;
  public price: string;
  public total_quantity: string;
  public exchange_trading_fee: string;
  public status: string;
  public submission_time: number;
  public completion_time: number;
  public filled_quantity: string;

  constructor(data: ExecutionOrder) {
    Object.assign(this, data);
  }
}
