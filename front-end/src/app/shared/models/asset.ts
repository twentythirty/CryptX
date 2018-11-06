export class Asset {
  public id: number;
  public symbol: string;
  public long_name: string;
  public is_base: boolean | string;
  public is_deposit: boolean | string;

  public capitalization?: number | string;
  public nvt_ratio?: number | string;
  public market_share?: number | string;
  public capitalization_updated?: any;
  public status?: string;
  public statusCode?: number;
  public is_cryptocurrency?: boolean | string;

  constructor(data: Asset) {
    Object.assign(this, data);
  }
}


export class AssetStatus {
  public id?: number;
  public timestamp?: string;
  public asset_id?: number;
  public user?: {
    id: number,
    name: string,
    email: string
  };

  constructor(
    public type: string,
    public comment: any
  ) {}
}
