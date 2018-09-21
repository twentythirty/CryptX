import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { environment } from '../../../environments/environment';
import { LiquidityRequirementsCreateRequestData } from '../../shared/models/api/liquidityRequirementsCreateRequestData';
import { LiquidityRequirement } from '../../shared/models/liquidityRequirement';

export class LiquidityResponse {
  success: boolean;
  liquidity_requirement: LiquidityRequirement;
}

export class ExchangesResponse {
  success: boolean;
  count: number;
  footer: Array<any>;
  exchanges: Array<any>;
}

export class LiquidityRequirementsCreateResponse {
  success: boolean;
  liquidity_requirement: any;
  error?: string;
}

export class LiquiditiesAllResponse {
  success: boolean;
  count: number;
  footer: Array<any>;
  liquidity_requirements: Array<LiquidityRequirement>;
}


@Injectable()
export class LiquidityService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  getLiquidity(liquidityId: number): Observable<LiquidityResponse> {
    return this.http.get<LiquidityResponse>(this.baseUrl + `liquidity_requirements/${liquidityId}`);
  }

  getExchanges(liquidityId: number): Observable<ExchangesResponse> {
    return this.http.get<ExchangesResponse>(this.baseUrl + `liquidity_requirements/${liquidityId}/exchanges`);
  }

  getAllLiquidities(request?: EntitiesFilter): Observable<LiquiditiesAllResponse> {
    if (request) {
      return this.http.post<LiquiditiesAllResponse>(this.baseUrl + `liquidity_requirements/all`, request);
    } else {
      return this.http.get<LiquiditiesAllResponse>(this.baseUrl + `liquidity_requirements/all`);
    }
  }

  createLiquidityRequirement(request: LiquidityRequirementsCreateRequestData): Observable<LiquidityRequirementsCreateResponse> {
    return this.http.post<LiquidityRequirementsCreateResponse>(this.baseUrl + `liquidity_requirements/create`, request);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `liquidity_requirements/header_lov/${column_name}`).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          }
          return null;
        }
      )
    );
  }

}
