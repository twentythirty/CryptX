import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustodiansListComponent } from './custodians-list/custodians-list.component';
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "../../shared/shared.module";
import { RouterModule } from "@angular/router";
import { ColdStorageService } from "../../services/cold-storage/cold-storage.service";
import { CustodiansAddComponent } from './custodians-add/custodians-add.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    RouterModule
  ],
  declarations: [CustodiansListComponent, CustodiansAddComponent],
  providers: [ColdStorageService]
})
export class ColdStorageCustodiansModule { }
