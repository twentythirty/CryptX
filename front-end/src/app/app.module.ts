import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router }   from '@angular/router';
import { HttpClientModule }   from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavigationComponent } from './shared/components/navigation/navigation.component';

import { AuthService } from './services/auth/auth.service';

import { PreRequestAuthInterceptor, PostRequestAuthInterceptor } from './config/http/auth.http.insterceptor';
import { AppRoutingModule } from './config/routes/routes';
import { LoginModule } from './modules/login/login.component';
import { DashboardModule } from './modules/dashboard/dashboard.component';
import { AuthGuard } from './config/routes/route-auth.guard';
import { PermissionGuard } from './config/routes/route-permission.guard';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    LoginModule,
    DashboardModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PreRequestAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PostRequestAuthInterceptor,
      multi: true
    },
    AuthService,
    AuthGuard,
    PermissionGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  constructor (private authService: AuthService, private router: Router) {
    this.authService.checkAuth().subscribe(status => {
      // checking auth
    });
  }
  
}
