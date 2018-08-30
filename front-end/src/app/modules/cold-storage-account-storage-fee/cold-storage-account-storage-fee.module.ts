import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ColdStorageAccountStorageFeeListComponent } from './cold-storage-account-storage-fee-list/cold-storage-account-storage-fee-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ColdStorageService } from '../../services/cold-storage/cold-storage.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    RouterModule
  ],
  declarations: [ColdStorageAccountStorageFeeListComponent],
  providers: [ColdStorageService]
})
export class ColdStorageAccountStorageFeeModule { }
