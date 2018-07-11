import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvestmentRoutingModule } from './investment-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { TimelineDetailComponent } from './timeline-detail/timeline-detail.component';
import { TimelineComponent } from './timeline/timeline.component';
import { InvestmentRunDetailComponent } from './investment-run-detail/investment-run-detail.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule, // TODO: Remove this when moving to lazy loaded modules
    SharedModule
    // InvestmentRoutingModule
  ],
  declarations: [TimelineDetailComponent, TimelineComponent, InvestmentRunDetailComponent]
})
export class InvestmentModule { }
