import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { InvestmentRunDetailComponent } from './investment-run-detail/investment-run-detail.component';
import { RecipeRunDetailComponent } from './recipe-run-detail/recipe-run-detail.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { ExecutionOrderDetailComponent } from './execution-order-detail/execution-order-detail.component';
import { ExecutionOrderFillDetailComponent } from './execution-order-fill-detail/execution-order-fill-detail.component';
import { DepositDetailComponent } from './deposit-detail/deposit-detail.component';
import { ExecutionOrdersComponent } from './execution-orders/execution-orders.component';
import { OrderGroupComponent } from './order-group/order-group.component';
import { ColdStorageTransfersDetailComponent } from './cold-storage-transfers-detail/cold-storage-transfers-detail.component';
import { TimelineDetailComponent } from './timeline-detail/timeline-detail.component';

import { AuthService } from '../../services/auth/auth.service';
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';
import { DepositModule } from '../deposit/deposit.module';
import { InvestmentService } from '../../services/investment/investment.service';
import { ColdStorageService } from '../../services/cold-storage/cold-storage.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule, // TODO: Remove this when moving to lazy loaded modules
    SharedModule,
    DepositModule,
  ],
  declarations: [
    InvestmentRunDetailComponent,
    RecipeRunDetailComponent,
    OrderDetailComponent,
    ExecutionOrderDetailComponent,
    ExecutionOrderFillDetailComponent,
    DepositDetailComponent,
    ExecutionOrdersComponent,
    OrderGroupComponent,
    ColdStorageTransfersDetailComponent,
    TimelineDetailComponent,
  ],
  providers: [
    AuthService,
    ColdStorageService,
    InvestmentService,
    ModelConstantsService,
  ]
})
export class InvestmentModule { }
