import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColdStorageAccountStorageFeeListComponent } from './cold-storage-account-storage-fee-list/cold-storage-account-storage-fee-list.component';
import { SharedModule } from '../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { ColdStorageService } from '../../services/cold-storage/cold-storage.service';
import { RouterModule } from '@angular/router';

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
