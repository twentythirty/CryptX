import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsListComponent } from './accounts-list/accounts-list.component';
import { AddAccountComponent } from './add-account/add-account.component';
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "../../shared/shared.module";
import { RouterModule } from "@angular/router";
import { ColdStorageService } from "../../services/cold-storage/cold-storage.service";

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    RouterModule,
  ],
  declarations: [AccountsListComponent, AddAccountComponent],
  providers: [ColdStorageService]
})
export class ColdStorageAccountsModule { }
