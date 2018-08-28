import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router }   from '@angular/router';
import { HttpClientModule, HttpClient }   from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { NavigationComponent } from './shared/components/navigation/navigation.component';

import { AuthService } from './services/auth/auth.service';
import { RolesService } from './services/roles/roles.service';
import { UsersService } from './services/users/users.service';
import { ModelConstantsService } from './services/model-constants/model-constants.service';

import { PreRequestAuthInterceptor, PostRequestAuthInterceptor, PostRequestErrorInterceptor } from './config/http/auth.http.insterceptor';
import { appInitialization } from './config/app-initialization';
import { AppRoutingModule } from './config/routes/routes';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthGuard } from './config/routes/route-auth.guard';
import { PermissionGuard } from './config/routes/route-permission.guard';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AssetModule } from './modules/asset/asset.module';
import { AssetService } from './services/asset/asset.service';
import { InvestmentService } from './services/investment/investment.service';
import { InvestmentModule } from './modules/investment/investment.module';
import { InstrumentsModule } from './modules/instruments/instruments.module';
import { LiquidityModule } from './modules/liquidity/liquidity.module';
import { DepositModule } from "./modules/deposit/deposit.module";
import { OrdersModule } from './modules/orders/orders.module';
import { RecipeRunModule } from "./modules/recipe-run/recipe-run.module";
import { ExecutionOrdersModule } from "./modules/execution-orders/execution-orders.module";
import { ColdStorageTransfersModule } from "./modules/cold-storage-transfers/cold-storage-transfers.module";
import { ColdStorageAccountsModule } from "./modules/cold-storage-accounts/cold-storage-accounts.module";
import { ColdStorageCustodiansModule } from "./modules/cold-storage-custodians/cold-storage-custodians.module";
import { ColdStorageAccountStorageFeeModule } from './modules/cold-storage-account-storage-fee/cold-storage-account-storage-fee.module';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(
    httpClient,
    `${environment.baseUrl}fe/i18n/`,
    `.json?d=${Date.now()}`
  );
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AuthModule,
    DashboardModule,
    MatSnackBarModule,
    RolesModule,
    UsersModule,
    AssetModule,  // TODO: Remove this when moving to lazy loaded modules
    InvestmentModule, // TODO: Remove this when moving to lazy loaded modules
    InstrumentsModule,
    LiquidityModule,
    AppRoutingModule,
    ReactiveFormsModule,
    DepositModule,
    OrdersModule,
    RecipeRunModule,
    ExecutionOrdersModule,
    ColdStorageTransfersModule,
    ColdStorageAccountsModule,
    ColdStorageCustodiansModule,
    ColdStorageAccountStorageFeeModule,
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PostRequestErrorInterceptor,
      multi: true
    },
    AuthService,
    AuthGuard,
    PermissionGuard,
    RolesService,
    AssetService,
    UsersService,
    InvestmentService,
    ModelConstantsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor (private authService: AuthService, private router: Router) {

  }

}
