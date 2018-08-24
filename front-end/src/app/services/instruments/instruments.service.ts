import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { Instrument } from '../../shared/models/instrument';
import { InstrumentCreateRequestData } from '../../shared/models/api/instrumentCreateRequestData';
import { CheckMappingRequestData } from '../../shared/models/api/checkMappingRequestData';
import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { InstrumentExchangeMap } from '../../shared/models/instrumentExchangeMap';
import { AddMappingRequestData } from '../../shared/models/api/addMappingRequestData';

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

export class InstrumentsGetResponse {
  success: boolean;
  instrument: Instrument;
}

export class CheckMappingResponse {
  success: boolean;
  mapping_data: InstrumentExchangeMap;
}

export class AddMappingResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class InstrumentExchangesMappingResponse {
  success: boolean;
  mapping_data: Array<InstrumentExchangeMap>;
  footer: Array<any>;
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

  getInstrument(instrumentId: number): Observable<InstrumentsGetResponse> {
    return this.http.get<InstrumentsGetResponse>(this.baseUrl + `instruments/${instrumentId}`);
  }

  getInstrumentExchangesMapping(instrumentId: number, request?: EntitiesFilter): Observable<InstrumentExchangesMappingResponse> {
    if (request) {
      return this.http.post<InstrumentExchangesMappingResponse>(this.baseUrl + `instruments/${instrumentId}/exchanges`, request);
    } else {
      return this.http.get<InstrumentExchangesMappingResponse>(this.baseUrl + `instruments/${instrumentId}/exchanges`);
    }
  }

  checkMapping(request: CheckMappingRequestData): Observable<CheckMappingResponse> {
    return this.http.post<CheckMappingResponse>(this.baseUrl + `instruments/check_mapping`, request);
  }

  addMapping(instrumentId: number, request: AddMappingRequestData): Observable<AddMappingResponse> {
    return this.http.post<AddMappingResponse>(this.baseUrl + `instruments/${instrumentId}/add_mapping`, request);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `instruments/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() }
            });
          }
          return null;
        }
      )
    );
  }

}
