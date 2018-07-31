import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';

import { DepositListComponent } from './deposit-list/deposit-list.component';
import { DepositService } from "../../services/deposit/deposit.service";
import { DepositInfoComponent } from './deposit-info/deposit-info.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule,
  ],
  providers: [
    DepositService,
  ],
  declarations: [DepositListComponent, DepositInfoComponent]
})
export class DepositModule { } 
