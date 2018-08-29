import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';

import { DepositListComponent } from './deposit-list/deposit-list.component';
import { DepositInfoComponent } from './deposit-info/deposit-info.component';

import { DepositService } from "../../services/deposit/deposit.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule,
  ],
  declarations: [
    DepositListComponent,
    DepositInfoComponent,
  ],
  providers: [
    DepositService,
  ]
})
export class DepositModule { } 
