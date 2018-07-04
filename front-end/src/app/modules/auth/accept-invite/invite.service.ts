import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class InviteService {
  baseUrl: String = 'api/v1/';

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
