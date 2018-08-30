import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';

import { Observable,  of, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { User } from '../../shared/models/user';
import PERMISSIONS from '../../config/permissions';

import { ModelConstantsService } from '../model-constants/model-constants.service';
import { environment } from '../../../environments/environment';

export class LoginReponse {
  success: boolean
  token: string
  permissions: Array<string>
  user: User
  model_constants: Object
  validators: Object
}

@Injectable()
export class AuthService {
  user: User;
  permissions:Array<string> = [];
  authChecked:boolean = false;
  baseUrl: string = environment.baseUrl;
  validation;

  constructor(private http: HttpClient, private modelConstants: ModelConstantsService) { }

  authenticate(username: string, password: string) {
    return this.http.post<LoginReponse>(this.baseUrl + 'users/login', {
      username: username,
      password: password
    }).pipe(
      tap(data => {
        if (data.success) {
          this.setAuthData(data);
        }
      })
    );
  } 

  setAuthData(data): void {
    //this.setToken(data.token);
    this.setUser(data.user);
    this.setValidators(data.validators)
    this.setPermissions(data.permissions);
    this.modelConstants.setConstants(data.model_constants);
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

  setValidators (validators) {
    localStorage.setItem('validators', JSON.stringify(validators));
  }

  getValidators (path:string, key: string) {
    this.validation = JSON.parse(localStorage.getItem('validators'));
    let validate = this.validation[path];

    if (!validate) {
      return;
    } else if (validate[key] === "not_blank") {
      return Validators.required;
    } else if (validate[key] === "email") {
      return Validators.email;
    } else if (validate[key] === "not_empty") {
      return Validators.required;
    }
  }

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

  logOut(){
    return this.http.get<any>(this.baseUrl + '/logout');
  }

  deauthorize () {
    console.log("Deleting token and validators");
    localStorage.removeItem('token');
    localStorage.removeItem('validators');
    delete this.user;
    delete this.permissions;
  }

  /** Checks if user is logged in by sending JWT token, also makes separate request
   * to receive users permissions. */
  checkAuth(): Observable<any> {
    let token = this.getToken();
    if (!token) return of(false);

    return forkJoin(
      this.http.get<any>(this.baseUrl + 'users/login/check').pipe(
        tap((response) => {
          if (response.success) {
            this.setUser(response.user);
            this.setPermissions(response.permissions);
            this.modelConstants.setConstants(response.model_constants);
          }
          this.authChecked = true;
        })
      )
    );
  }

  /** Gets permissions and saves them
   */
  refreshPermissions() {
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

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'send_reset_token', {
      email
    });
  }

  checkResetTokenValidity(reset_token: string) {
    return this.http.get<any>(this.baseUrl + 'password_reset/' + reset_token);
  }

  resetPassword(reset_token: string, new_password: string) {
    return this.http.post<any>(this.baseUrl + 'password_reset/' + reset_token, {
      new_password
    });
  }

  changeInfo(new_info: Object) {
    return this.http.post<any>(this.baseUrl + 'users/me/change_password', new_info).pipe(
      tap(response => {
        this.user = response.user;
      })
    );
  }
}


