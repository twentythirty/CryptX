import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';

import { InstrumentAddComponent } from './instrument-add/instrument-add.component';
import { InstrumentListComponent } from './instrument-list/instrument-list.component';

import { InstrumentsService } from '../../services/instruments/instruments.service';
import { ExchangesService } from '../../services/exchanges/exchanges.service';
import { AssetService } from '../../services/asset/asset.service';
import { InstrumentInfoComponent } from './instrument-info/instrument-info.component';

import { PendingChangesGuard } from '../../config/routes/route-pending-changes.guard';

@NgModule({
  declarations: [
    InstrumentAddComponent,
    InstrumentListComponent,
    InstrumentInfoComponent,
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
    AssetService,
    InstrumentsService,
    ExchangesService,
    PendingChangesGuard
  ],
})
export class InstrumentsModule { }
