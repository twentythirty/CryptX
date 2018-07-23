import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';

import { LiquidityListComponent } from './liquidity-list/liquidity-list.component';
import { LiquidityCreateComponent } from './liquidity-create/liquidity-create.component';
import { RouterModule } from '@angular/router';
import { LiquidityService } from '../../services/liquidity/liquidity.service';
import { ExchangesService } from '../../services/exchanges/exchanges.service';

@NgModule({
  declarations: [
    LiquidityListComponent,
    LiquidityCreateComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    SharedModule,
    NguiAutoCompleteModule,
  ],
  providers: [
    LiquidityService,
    ExchangesService,
  ],
})
export class LiquidityModule { }
