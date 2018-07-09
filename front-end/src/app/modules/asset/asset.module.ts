import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { AssetRoutingModule } from './asset-routing.module';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetViewComponent } from './asset-view/asset-view.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AssetRoutingModule
  ],
  declarations: [AssetListComponent, AssetViewComponent]
})
export class AssetModule { }
