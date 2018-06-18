import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap, delay } from 'rxjs/operators';

import { User } from '../../shared/models/user';
import PERMISSIONS from '../../config/permissions';

export class LoginReponse {
  success: boolean
  token: string
  permissions: Array<string>
  user: User
}

@Injectable()
export class AuthService {
  user: User;
  permissions:Array<string> = [];
  authChecked:boolean = false;

  constructor(private http: HttpClient) { 

  }

  authenticate(username: string, password: string) {
    return this.http.post<LoginReponse>('/api/v1/users/login', {
      username: username,
      password: password
    }).do(data => {
      if (data.success)
        this.setSession(data);
    });
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  hasPermission(permission_code): boolean {
    if (!PERMISSIONS.hasOwnProperty(permission_code)) {
      console.error("Inexistant permission code supplied");
      return false;
    }

    return this.permissions.includes(PERMISSIONS[permission_code]);
  };

  setSession(data: LoginReponse) {
    this.setToken(data.token);
    this.setUser(data.user);
    this.permissions = data.permissions;
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  setUser(user: User) {
    this.user = user;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  deauthorize() {
    localStorage.removeItem('token');
    delete this.user;
  }

  checkAuth(): Observable<boolean> {
    let token = this.getToken();
    if (!token) return Observable.of(false);

    return this.http.get<any>('/api/v1/users/me').pipe(
      map((data) => {
        this.user = data.user;
        this.authChecked = true;
        return data.status;
      })
    );
  }
}


