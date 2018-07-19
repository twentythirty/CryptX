import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { Instrument } from '../../shared/models/instrument';
import { InstrumentCreateRequestData } from '../../shared/models/api/instrumentCreateRequestData';
import { environment } from '../../../environments/environment';

export class InstrumentsCreateResponse {
  success: boolean;
  instrument: Instrument;
  message?: string;
}

@Injectable()
export class InstrumentsService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  createInstrument(request: InstrumentCreateRequestData): Observable<InstrumentsCreateResponse> {
    return this.http.post<InstrumentsCreateResponse>(this.baseUrl + `instruments/create`, request);
  }
}
