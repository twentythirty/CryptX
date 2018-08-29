import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { SharedModule } from '../../shared/shared.module';

// import { AssetRoutingModule } from './asset-routing.module';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetViewComponent } from './asset-view/asset-view.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule, // TODO: Remove this when moving to lazy loaded modules
    SharedModule,
    // AssetRoutingModule
  ],
  declarations: [
    AssetListComponent,
    AssetViewComponent,
  ],
  providers: [
    CurrencyPipe
  ],
})
export class AssetModule { }
