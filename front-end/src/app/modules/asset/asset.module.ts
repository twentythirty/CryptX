import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { SharedModule } from '../../shared/shared.module';

// import { AssetRoutingModule } from './asset-routing.module';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetViewComponent } from './asset-view/asset-view.component';

import { AssetService } from '../../services/asset/asset.service';
import { AuthService } from '../../services/auth/auth.service';
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule, // TODO: Remove this when moving to lazy loaded modules
    SharedModule,
  ],
  declarations: [
    AssetListComponent,
    AssetViewComponent,
  ],
  providers: [
    AssetService,
    AuthService,
    CurrencyPipe,
    ModelConstantsService,
  ],
})
export class AssetModule { }
