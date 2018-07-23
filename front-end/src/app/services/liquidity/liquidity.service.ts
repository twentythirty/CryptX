import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { environment } from '../../../environments/environment';
import { LiquidityRequirementsCreateRequestData } from '../../shared/models/api/liquidityRequirementsCreateRequestData';

export class LiquidityRequirementsCreateResponse {
  success: boolean;
  liquidity_requirement: any;
  error: string;
}

@Injectable()
export class LiquidityService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  createLiquidityRequirement(request: LiquidityRequirementsCreateRequestData): Observable<LiquidityRequirementsCreateResponse> {
    return this.http.post<LiquidityRequirementsCreateResponse>(this.baseUrl + `/liquidity_requirements/create`, request);
  }

}
