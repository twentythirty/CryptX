import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { environment } from '../../../environments/environment';

export class ExchangesAllResponse {
  success: boolean;
  exchanges: Array<any>;
  count: number;
}

export class ExchangesInstrumentIdentifiersResponse {
  identifiers: Array<string>;
  success: boolean;
}

@Injectable()
export class ExchangesService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  getAllExchanges(ignore: boolean = false): Observable<ExchangesAllResponse> {
    return this.http.get<ExchangesAllResponse>(this.baseUrl + `exchanges/all/?ignore_unmappable=${ignore}`);
  }

  getExchangeInstrumentIdentifiers(exchangeId): Observable<ExchangesInstrumentIdentifiersResponse> {
    return this.http.get<ExchangesInstrumentIdentifiersResponse>(this.baseUrl + `exchanges/${exchangeId}/instruments`);
  }

}
