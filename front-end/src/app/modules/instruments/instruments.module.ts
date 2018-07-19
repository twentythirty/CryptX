import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';

import { InstrumentAddComponent } from './instrument-add/instrument-add.component';
import { InstrumentListComponent } from './instrument-list/instrument-list.component';

import { InstrumentsService } from '../../services/instruments/instruments.service';

@NgModule({
  declarations: [
    InstrumentAddComponent,
    InstrumentListComponent,
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
    InstrumentsService
  ],
})
export class InstrumentsModule { }
