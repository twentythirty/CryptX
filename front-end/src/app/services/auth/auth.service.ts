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
  baseUrl$: string = 'api/v1/users/me';

  constructor(private http: HttpClient, private router: Router) {
    this.getFromCache();
  }

  authenticate(username: string, password: string) {
    return this.http.post<LoginReponse>('/api/v1/users/login', {
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

  hasPermission(permission_code): boolean {
    if (!this.permissions)
      return false;

    if (!PERMISSIONS.hasOwnProperty(permission_code)) {
      console.error("Inexistant permission code supplied");
      return false;
    }

    return this.permissions.includes(PERMISSIONS[permission_code]);
  };

  setToken (token) {
    localStorage.setItem('token', token);
  }

  setUser (user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
  }

  setPermissions (permissions: Array<string>) {
    localStorage.setItem('permissions', JSON.stringify(permissions));
    this.permissions = permissions;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getFromCache () {
    let user = JSON.parse(localStorage.getItem('user')),
      perms = JSON.parse(localStorage.getItem('permissions'));

    this.user = user ? user : undefined;
    this.permissions = perms ? perms : undefined;
  }

  deauthorize () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    delete this.user;
    delete this.permissions;
  }

  /** Checks if user is logged in by sending JWT token, also makes separate request
   * to receive users permissions. */
  checkAuth(): Observable<any> {
    let token = this.getToken();
    if (!token) return Observable.of(false);

    return Observable.forkJoin(
      this.http.get<any>('/api/v1/users/me').pipe(
        tap((response) => {
          if (response.success) {
            this.setUser(response.user);
          }
          this.authChecked = true;
        }),
        catchError(error => {
          this.deauthorize();
          this.router.navigate(['login']);
          return of(`Bad Promise: `, error);
        })
      ),
      this.http.get<any>('/api/v1/users/me/permissions').pipe(
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
    return this.http.get<any>('/api/v1/users/me/permissions').pipe(
      tap((response) => {
        this.setPermissions(response.permissions);
        return response.success;
      }),
      catchError(error => {
        return of(`Bad Promise: `, error);
      })
    );
  }
}


