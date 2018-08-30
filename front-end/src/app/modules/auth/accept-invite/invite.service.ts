import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable()
export class InviteService {
  baseUrl: String = environment.baseUrl;

  constructor(private http: HttpClient) { }

  checkToken (token: String) {
    return this.http.post<any>(this.baseUrl + 'users/invitation', {
      token
    });
  }

  fulfillInvitation (data: Object) {
    return this.http.post<any>(this.baseUrl + 'users/create-invited', data);
  }
}
