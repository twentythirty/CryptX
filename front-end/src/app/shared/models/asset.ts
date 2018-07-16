export class Asset {
  public id: number;
  public symbol: string;
  public long_name: string;
  public is_base: boolean;
  public is_deposit: boolean;

  public capitalization: number;
  public nvt_ratio: number;
  public market_share: number;
  public capitalization_updated: any;
  public status: (string | number);

  // Not yet implemented
  public capitalization_updated_timestamp: number;
  public is_cryptocurrency: boolean;
}


export class AssetStatus {

  public id?: number;
  public timestamp?: string;
  public asset_id?: number;
  public user_id?: number;

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

export const AssetStatuses = {
  '400': 'Whitelisted',
  '401': 'Blacklisted',
  '402': 'Greylisted',
  'Whitelisted': '400',
  'Blacklisted': '401',
  'Greylisted': '402'
}
