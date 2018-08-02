import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';

import { OrdersListComponent } from './orders-list/orders-list.component';
import { OrdersService } from '../../services/orders/orders.service';

@NgModule({
  declarations: [
    OrdersListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    SharedModule,
  ],
  providers: [
    OrdersService,
  ],
})
export class OrdersModule { }
