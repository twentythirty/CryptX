import { Injectable , Injector} from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';

import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class PreRequestAuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {

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

    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff if needed
      }
    }, (err: any) => {
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
    });
  }
}

@Injectable()
export class PostRequestErrorInterceptor implements HttpInterceptor {

  constructor(public snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // Do nothing
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if(err && err.error && (err.error.success === false) &&
           (typeof err.error.error == 'string')) {
            let snackBarRef = this.snackBar.open(err.error.error, 'Close', {
              panelClass: 'mat-snack-bar-error',
              verticalPosition: 'top',
              duration: 5000
            });
          }
      }
    });
  }
}
