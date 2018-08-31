export class Deposit {
  public id: number
  public recipe_run_id: number
  public investment_run_id: number
  public quote_asset_id: number
  public quote_asset: string
  public exchange_id: number
  public exchange: string
  public account: string
  public amount: string
  public investment_percentage: string
  public deposit_management_fee: string
  public depositor_user: string
  public status: string
}

export class DepositStatus {
/*
  public id?: number;
  public timestamp?: string;
  public deposit_id?: number;
  public user_id?: number;

  constructor(
    public type: string,
    public comment: any
  ) {}*/
}