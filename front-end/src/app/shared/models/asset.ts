export class Asset {
  public id: number;
  public symbol: string;
  public long_name: string;
  public is_base: boolean;
  public is_deposit: boolean;

  public capitalisation_updated_timestamp: number;
  public capitalisation: number;
  public is_cryptocurrency: boolean;
  public is_greylisted: boolean;
  public is_blacklisted: boolean;
  public market_share: number;
  public nvt_ratio: number;
}


export class AssetStatus {
  constructor(
    public type: AssetStatusChanges,
    public comment: any
  ) {}
}

export enum AssetStatusChanges {
  Whitelisting = 400,
  Blacklisting = 401,
  Graylisting = 402
}
