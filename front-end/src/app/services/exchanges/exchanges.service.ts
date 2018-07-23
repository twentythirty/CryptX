import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { environment } from '../../../environments/environment';

export class ExchangesAllResponse {
  exchanges: Array<any>;
  status: boolean;
  count: number;
}

@Injectable()
export class ExchangesService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  getAllExchanges(request?: EntitiesFilter): Observable<ExchangesAllResponse>{
    if (request) {
      return this.http.post<ExchangesAllResponse>(this.baseUrl + `exchanges/all`, request);
    } else {
      return this.http.get<ExchangesAllResponse>(this.baseUrl + `exchanges/all`);
    }
  }

}
