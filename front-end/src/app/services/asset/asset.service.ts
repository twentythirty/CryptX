import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { Asset, AssetStatus } from '../../shared/models/asset';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { ActionResultData } from '../../shared/models/api/actionResultData';

export class AssetsAllResponse {
  success: boolean;
  assets: Array<Asset>;
  count: number;
}

export class AssetResultData {
  success: boolean;
  asset: Asset;
}

@Injectable()
export class AssetService {

  private baseUrl: string = 'api/v1/';

  constructor(private http: HttpClient) { }

  getAllAssets(requestData?: EntitiesFilter): Observable<AssetsAllResponse>{
    if(requestData) {
      return this.http.post<AssetsAllResponse>(this.baseUrl + `assets/all`, requestData);
    } else {
      return this.http.get<AssetsAllResponse>(this.baseUrl + `assets/all`);
    }
  }

  getAsset(assetId: number) {
    return this.http.get<AssetResultData>(this.baseUrl + `assets/${assetId}`);
  }

  changeAssetStatus(assetId: number, status: AssetStatus): Observable<any> {
    return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/change_status`, status);
  }

  // blacklistAsset(assetId: number, is_blacklisted: boolean): Observable<ActionResultData> {
  //   return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/blacklist`, { is_blacklisted });
  // }

  // greylistAsset(assetId: number, is_greylisted: boolean): Observable<ActionResultData> {
  //   return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/greylist`, { is_greylisted });
  // }

}
