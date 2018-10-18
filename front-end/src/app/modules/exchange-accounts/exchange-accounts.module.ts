import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeAccountsListComponent } from './exchange-accounts-list/exchange-accounts-list.component';
import { ExchangeAccountsAddComponent } from './exchange-accounts-add/exchange-accounts-add.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { ExchangesService } from '../../services/exchanges/exchanges.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule
  ],
  declarations: [ExchangeAccountsListComponent, ExchangeAccountsAddComponent],
  providers: [
    ExchangesService,
  ]
})
export class ExchangeAccountsModule { }
