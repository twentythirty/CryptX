export class ExchangeAccount {
  public id: number;
  public asset_id: number;
  public asset:	string;
  public exchange_id:	number;
  public exchange:	string;
  public address:	string;
  public is_active:	string;

  constructor(data: ExchangeAccount) {
    Object.assign(this, data);
  }
}
