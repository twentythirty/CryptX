import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsListComponent } from './accounts-list/accounts-list.component';
import { AddAccountComponent } from './add-account/add-account.component';
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "../../shared/shared.module";
import { RouterModule } from "@angular/router";
import { ColdStorageService } from "../../services/cold-storage/cold-storage.service";
import { NguiAutoCompleteModule } from "@ngui/auto-complete/dist";
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';
import { AssetService } from '../../services/asset/asset.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    RouterModule,
    NguiAutoCompleteModule,
  ],
  declarations: [
    AccountsListComponent,
    AddAccountComponent,
  ],
  providers: [
    AssetService,
    ColdStorageService,
    ModelConstantsService,
  ]
})
export class ColdStorageAccountsModule { }
