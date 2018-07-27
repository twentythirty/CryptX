import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { Asset, AssetStatus } from '../../shared/models/asset';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { ActionResultData } from '../../shared/models/api/actionResultData';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export class AssetsAllResponse {
  success: boolean;
  assets: Array<Asset>;
  count: number;
}

export class AssetsAllResponseDetailed {
  success: boolean;
  assets: Array<Asset>;
  footer: Array<any>
  count: number;
}

export class AssetResultData {
  success: boolean;
  asset: Asset;
  history: Array<AssetStatus>;
}

@Injectable()
export class AssetService {

  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAllAssets(requestData?: EntitiesFilter): Observable<AssetsAllResponse>{
    if(requestData) {
      return this.http.post<AssetsAllResponse>(this.baseUrl + `assets/all`, requestData);
    } else {
      return this.http.get<AssetsAllResponse>(this.baseUrl + `assets/all`);
    }
  }

  getAllAssetsDetailed(requestData?: EntitiesFilter): Observable<AssetsAllResponseDetailed>{
    if(requestData) {
      return this.http.post<AssetsAllResponseDetailed>(this.baseUrl + `assets/detailed/all`, requestData);
    } else {
      return this.http.get<AssetsAllResponseDetailed>(this.baseUrl + `assets/detailed/all`);
    }
  }

  getAsset(assetId: number) {
    return this.http.get<AssetResultData>(this.baseUrl + `assets/detailed/${assetId}`);
  }

  changeAssetStatus(assetId: number, status: AssetStatus): Observable<any> {
    return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/change_status`, status);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `assets/detailed/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && Array.isArray(res.lov)) {
            console.log(res.lov);
            return res.lov.map(lov => {
              return { value: lov }
            });
          } else return null;
        }
      )
    )
  }

  // blacklistAsset(assetId: number, is_blacklisted: boolean): Observable<ActionResultData> {
  //   return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/blacklist`, { is_blacklisted });
  // }

  // greylistAsset(assetId: number, is_greylisted: boolean): Observable<ActionResultData> {
  //   return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/greylist`, { is_greylisted });
  // }

}
