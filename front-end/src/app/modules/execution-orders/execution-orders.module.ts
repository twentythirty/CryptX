import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';

import { ExecutionOrderListComponent } from './execution-order-list/execution-order-list.component';

import { ExecutionOrdersService } from "../../services/execution-orders/execution-orders.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule
  ],
  declarations: [
    ExecutionOrderListComponent
  ],
  providers: [
    ExecutionOrdersService,
  ]
})
export class ExecutionOrdersModule { }
