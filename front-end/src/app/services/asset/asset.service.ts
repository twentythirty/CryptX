import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { Asset } from '../../shared/models/asset';
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

  constructor(private http: HttpClient) { }

  getAllAssets(requestData?: EntitiesFilter): Observable<AssetsAllResponse>{
    if(requestData) {
      return this.http.post<AssetsAllResponse>(`assets/all`, requestData);
    } else {
      return this.http.get<AssetsAllResponse>(`assets/all`);
    }
  }

  getAsset(assetId: number) {
    return this.http.get<AssetResultData>(`assets/${assetId}`);
  }

  blacklistAsset(assetId: number, is_blacklisted: boolean): Observable<ActionResultData> {
    return this.http.post<ActionResultData>(`assets/${assetId}/blacklist`, { is_blacklisted });
  }

  greylistAsset(assetId: number, is_greylisted: boolean): Observable<ActionResultData> {
    return this.http.post<ActionResultData>(`assets/${assetId}/greylist`, { is_greylisted });
  }

}
