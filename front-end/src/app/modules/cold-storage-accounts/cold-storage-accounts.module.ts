import { NgModule } from '@angular/core';
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { NguiAutoCompleteModule } from "@ngui/auto-complete/dist";

import { AccountsListComponent } from './accounts-list/accounts-list.component';
import { AddAccountComponent } from './add-account/add-account.component';
import { SharedModule } from "../../shared/shared.module";
import { ColdStorageService } from "../../services/cold-storage/cold-storage.service";
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
  ]
})
export class ColdStorageAccountsModule { }
