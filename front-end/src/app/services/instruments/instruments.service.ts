import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { Instrument } from '../../shared/models/instrument';
import { InstrumentCreateRequestData } from '../../shared/models/api/instrumentCreateRequestData';
import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';

export class InstrumentsAllResponse {
  success: boolean;
  instruments: Array<Instrument>;
  footer: Array<any>
  count: number;
}

export class InstrumentsCreateResponse {
  success: boolean;
  instrument: Instrument;
  error?: string;
}

@Injectable()
export class InstrumentsService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  getAllInstruments(request?: EntitiesFilter): Observable<InstrumentsAllResponse>{
    if (request) {
      return this.http.post<InstrumentsAllResponse>(this.baseUrl + `instruments/all`, request);
    } else {
      return this.http.get<InstrumentsAllResponse>(this.baseUrl + `instruments/all`);
    }
  }

  createInstrument(request: InstrumentCreateRequestData): Observable<InstrumentsCreateResponse> {
    return this.http.post<InstrumentsCreateResponse>(this.baseUrl + `instruments/create`, request);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `instruments/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov }
            });
          }
          return null;
        }
      )
    );
  }

}
