import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable()
export class InvestmentService {

  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

}
