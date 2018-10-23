import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeCredentialsListComponent } from './exchange-credentials-list/exchange-credentials-list.component';
import { ExchangeCredentialsAddComponent } from './exchange-credentials-add/exchange-credentials-add.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ExchangesService } from '../../services/exchanges/exchanges.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    BrowserModule
  ],
  declarations: [ExchangeCredentialsListComponent, ExchangeCredentialsAddComponent],
  providers: [
    ExchangesService,
  ]
})
export class ExchangeCredentialsModule { }
