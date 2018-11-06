import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { InvestmentNewComponent } from './investment-new/investment-new.component';
import { InvestmentService } from '../../services/investment/investment.service';
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    DashboardComponent,
    InvestmentNewComponent,
  ],
  providers: [
    InvestmentService,
    ModelConstantsService,
  ]
})
export class DashboardModule { }
