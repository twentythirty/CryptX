import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

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
  baseUrl: string = 'api/v1/';

  constructor(private http: HttpClient) { }

  authenticate(username: string, password: string) {
    return this.http.post<LoginReponse>(this.baseUrl + 'users/login', {
      username: username,
      password: password
    }).do(data => {
      if (data.success) {
        this.setToken(data.token);
        this.setUser(data.user);
        this.setPermissions(data.permissions);
      }
    });
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  hasPermissions(perm_keys: Array<string>): boolean {
    if (perm_keys.length && !this.permissions.length) {
      return false;
    }

    if (perm_keys.some(perm_key => !PERMISSIONS.hasOwnProperty(perm_key))) {
      console.error("Inexistant permission code supplied");
      return false;
    }

    return perm_keys.every(
      perm_key => this.permissions.includes(PERMISSIONS[perm_key])
    );
  };

  setToken (token) {
    localStorage.setItem('token', token);
  }

  setUser (user: User) {
    this.user = user;
  }

  setPermissions (permissions: Array<string>) {
    this.permissions = permissions;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  deauthorize () {
    localStorage.removeItem('token');
    delete this.user;
    delete this.permissions;
  }

  /** Checks if user is logged in by sending JWT token, also makes separate request
   * to receive users permissions. */
  checkAuth(): Observable<any> {
    let token = this.getToken();
    if (!token) return Observable.of(false);

    return Observable.forkJoin(
      this.http.get<any>(this.baseUrl + 'users/me').pipe(
        tap((response) => {
          if (response.success) {
            this.setUser(response.user);
          }
          this.authChecked = true;
        })
      ),
      this.http.get<any>(this.baseUrl + 'users/me/permissions').pipe(
        tap(response => {
          if (response.success)
            this.setPermissions(response.permissions);
        })
      )
    );
  }

  /** Gets permissions and saves them
   */
  refreshPermissions () {
    return this.http.get<any>(this.baseUrl + 'users/me/permissions').pipe(
      tap((response) => {
        this.setPermissions(response.permissions);
        return response.success;
      }),
      catchError(error => {
        return of(`Bad Promise: `, error);
      })
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<any>(this.baseUrl + 'send_reset_token', {
      email
    });
  }

  checkResetTokenValidity (reset_token: string) {
    return this.http.get<any>(this.baseUrl + 'password_reset/' + reset_token);
  }

  resetPassword (reset_token: string, new_password: string) {
    return this.http.post<any>(this.baseUrl + 'password_reset/' + reset_token, {
      new_password
    });
  }

  changeInfo (new_info: Object) {
    return this.http.post<any>(this.baseUrl + 'users/me/edit', new_info).pipe(
      tap(response => {
        this.user = response.user;
      })
    );
  }
}


