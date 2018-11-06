import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';

import { Asset, AssetStatus } from '../../shared/models/asset';
import { ActionLog } from '../../shared/models/actionLog';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { ActionResultData } from '../../shared/models/api/actionResultData';
import { environment } from '../../../environments/environment';

export class AssetsAllResponse {
  success: boolean;
  assets: Array<Asset>;
  count: number;
}

export class AssetsAllResponseDetailed {
  success: boolean;
  assets: Array<Asset>;
  footer: Array<any>;
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

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) {}

  getAllAssets(requestData?: EntitiesFilter): Observable<AssetsAllResponse> {
    if (requestData) {
      return this.http.post<AssetsAllResponse>(this.baseUrl + `assets/all`, requestData);
    } else {
      return this.http.get<AssetsAllResponse>(this.baseUrl + `assets/all`);
    }
  }

  getAllAssetsOfExchange(exchangeId: number): Observable<AssetsAllResponse> {
    return this.http.get<AssetsAllResponse>(this.baseUrl + `/assets/of_exchange/${exchangeId}`);
  }

  getAllAssetsDetailed(requestData?: EntitiesFilter): Observable<AssetsAllResponseDetailed> {
    if (requestData) {
      return this.http.post<AssetsAllResponseDetailed>(this.baseUrl + `assets/detailed/all`, requestData).pipe(
        tap(this.addStatusCode)
      );
    } else {
      return this.http.get<AssetsAllResponseDetailed>(this.baseUrl + `assets/detailed/all`).pipe(
        tap(this.addStatusCode)
      );
    }
  }

  getAsset(assetId: number) {
    return this.http.get<AssetResultData>(this.baseUrl + `assets/detailed/${assetId}`).pipe(
      tap(data => this.mapActivityLog(data))
    );
  }

  changeAssetStatus(assetId: number, status: AssetStatus): Observable<any> {
    return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/change_status`, status);
  }

  getHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.get<any>(this.baseUrl + `assets/detailed/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          } return null;
        }
      )
    );
  }

  private addStatusCode(data) {
    data.assets.map(asset => {
      asset.statusCode = _.toNumber( asset.status.replace('assets.status.', '') );
      return asset;
    });
    return data;
  }

  // Map activity log data for activity log common structure
  private mapActivityLog(data): ActionLog {
    let status,
        prevStatus;

    data.asset.statusCode = _.toNumber( data.asset.status.replace('assets.status.', '') );

    // default status 400, so first preStatus should be default
    this.translate.get('assets.status.400').subscribe(value => prevStatus = value);

    data.history = data.history.reverse().map(item => {
      this.translate.get(item.type).subscribe(value => status = value);

      const actionLogItem = {
        timestamp: item.timestamp,
        translationKey: 'assets.blacklisting_activity_log_item',
        translationArgs: {
          username: item.user.name,
          prevStatus: prevStatus,
          status: status
        },
        rationale: item.comment
      };

      prevStatus = status;

      return actionLogItem;
    }).reverse();

    return data;
  }

  // blacklistAsset(assetId: number, is_blacklisted: boolean): Observable<ActionResultData> {
  //   return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/blacklist`, { is_blacklisted });
  // }

  // greylistAsset(assetId: number, is_greylisted: boolean): Observable<ActionResultData> {
  //   return this.http.post<ActionResultData>(this.baseUrl + `assets/${assetId}/greylist`, { is_greylisted });
  // }

}
