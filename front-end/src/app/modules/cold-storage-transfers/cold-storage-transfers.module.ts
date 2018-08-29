import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransfersListComponent } from './transfers-list/transfers-list.component';
import { RouterModule } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "../../shared/shared.module";
import { ColdStorageService } from "../../services/cold-storage/cold-storage.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule,
  ],
  declarations: [TransfersListComponent],
  providers: [
    ColdStorageService,
  ]
})
export class ColdStorageTransfersModule { }
