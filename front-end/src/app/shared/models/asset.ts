export class Asset {
  public id: number;
  public symbol: string;
  public long_name: string;
  public is_base: boolean | string;
  public is_deposit: boolean;

  public capitalization: number;
  public nvt_ratio: number;
  public market_share: number;
  public capitalization_updated: any;
  public status: string;
  public statusCode?: number;

  // Not yet implemented
  public capitalization_updated_timestamp: number;
  public is_cryptocurrency: boolean | string;
}


export class AssetStatus {

  public id?: number;
  public timestamp?: string;
  public asset_id?: number;
  public user_id?: number;

  constructor(
    public type: string,
    public comment: any
  ) {}
}
