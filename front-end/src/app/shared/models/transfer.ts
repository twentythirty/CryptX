export class Transfer {
  public id: number;
  public asset: string;
  public asset_id: number;
  public gross_amount: number | string;
  public net_amount: number | string;
  public exchange_withdrawal_fee: number | string;
  public status: number | string;
  public destination_account: number | string;
  public cold_storage_account_id?: string;
  public custodian: string;
  public strategy_type: string;
  public source_exchange: string;
  public source_account: string;
  public placed_timestamp: number;
  public completed_timestamp: Date;

  constructor (data: Transfer) {
    Object.assign(this, data);
  }
}
