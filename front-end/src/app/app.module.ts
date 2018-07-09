import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router }   from '@angular/router';
import { HttpClientModule }   from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavigationComponent } from './shared/components/navigation/navigation.component';

import { AuthService } from './services/auth/auth.service';
import { RolesService } from './services/roles/roles.service';
import { UsersService } from './services/users/users.service';
import { ModelConstantsService } from './services/model-constants/model-constants.service';

import { PreRequestAuthInterceptor, PostRequestAuthInterceptor } from './config/http/auth.http.insterceptor';
import { appInitialization } from './config/app-initialization';
import { AppRoutingModule } from './config/routes/routes';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.component';
import { AuthGuard } from './config/routes/route-auth.guard';
import { PermissionGuard } from './config/routes/route-permission.guard';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AssetModule } from './modules/asset/asset.module';
import { AssetService } from './services/asset/asset.service';



@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AuthModule,
    DashboardModule,
    RolesModule,
    UsersModule,
    AssetModule,  // TODO: Remove this when moving to lazy loaded modules
    AppRoutingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitialization,
      multi: true,
      deps: [ AuthService ]
    },
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
    PermissionGuard,
    RolesService,
    AssetService,
    UsersService,
    ModelConstantsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor (private authService: AuthService, private router: Router) {

  }

}
