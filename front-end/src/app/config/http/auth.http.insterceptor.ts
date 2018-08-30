import { Injectable , Injector} from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

import { AuthService } from '../../services/auth/auth.service';


@Injectable()
export class PreRequestAuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem("token");

    if (token) {
      const cloned = req.clone({ // always add token if found
        headers: req.headers.set("Authorization", token)
      });

      return next.handle(cloned);
    }
    else {
      return next.handle(req);
    }
  }
}

@Injectable()
export class PostRequestAuthInterceptor implements HttpInterceptor {

  constructor(public authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff if needed
            const nextToken = _.get(event, 'body.next_token');

            if(nextToken) this.authService.setToken(nextToken);

          }
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) // if returns error code unauthorized
              this.authService.deauthorize();

            if (err.status === 403) {
              console.log("User didn't have permissions needed");
              this.authService.refreshPermissions().subscribe(data => {
                // do something with permission renewed permission data
              });
            }
          }
        }
      )
    );
  }
}

@Injectable()
export class PostRequestErrorInterceptor implements HttpInterceptor {

  constructor(public snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err, caught) => {
        if (err instanceof HttpErrorResponse) {
          console.log(err.status, err.error);

          if(err.status > 200 && err.status < 400) {
            return caught;
          } else {
            if(err && err.error && (err.error.success === false) &&
            (typeof err.error.error == 'string')) {
              let snackBarRef = this.snackBar.open(err.error.error, 'Close', {
                panelClass: 'mat-snack-bar-error',
                verticalPosition: 'top',
                duration: 5000
              });
            }
          }
        }
        return observableThrowError(err);
      }),
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // Do nothing
          }
        },
        (err: any) => {}
      )
    );
  }
}
