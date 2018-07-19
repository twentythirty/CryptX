import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';

import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { DynamicModule } from 'ng-dynamic-component';

import { BtnComponent } from './components/btn/btn.component'
import { DataTableComponent } from './components/data-table/data-table.component'
import { ModalComponent } from './components/modal/modal.component'
import { PaginationComponent } from './components/pagination/pagination.component';
import { ContentBlockComponent } from './components/content-block/content-block.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { ButtonCheckboxComponent } from './components/button-checkbox/button-checkbox.component';
import { FormActionBarComponent } from './components/form-action-bar/form-action-bar.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { DataTableFilterComponent } from './components/data-table-filter/data-table-filter.component'

import { FilterPipe } from './pipes/filter.pipe';
import { DataTableCommonManagerComponent } from './components/data-table-common-manager/data-table-common-manager.component';
import { ButtonBackComponent } from './components/button-back/button-back.component';
import { PageHeadingComponent } from './components/page-heading/page-heading.component';
import { RouterModule } from '@angular/router';
import { InputItemComponent } from './components/input-item/input-item.component';
import { ActionCellComponent } from './components/data-table-cells/action-cell/action-cell.component';
import { CurrencyCellComponent } from './components/data-table-cells/currency-cell/currency-cell.component';
import { PercentCellComponent } from './components/data-table-cells/percent-cell/percent-cell.component';
import { NumberCellComponent } from './components/data-table-cells/number-cell/number-cell.component';
import { DateCellComponent } from './components/data-table-cells/date-cell/date-cell.component';
import { BooleanCellComponent } from './components/data-table-cells/boolean-cell/boolean-cell.component';
import { InputItemErrorMessageComponent } from './components/input-item-error-message/input-item-error-message.component';
import { StatusCellComponent } from './components/data-table-cells/status-cell/status-cell.component';
import { ConfirmCellComponent } from './components/data-table-cells/confirm-cell/confirm-cell.component';
import { MatProgressSpinnerModule } from '@angular/material';
import { RationaleModalComponent } from './components/rationale-modal/rationale-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        Ng2FlatpickrModule,
        MatProgressSpinnerModule,
        TranslateModule,
        DynamicModule.withComponents([
          ActionCellComponent,
          CurrencyCellComponent,
          PercentCellComponent,
          NumberCellComponent,
          DateCellComponent,
          BooleanCellComponent,
          StatusCellComponent,
          ConfirmCellComponent
        ])
    ],
    declarations: [
        BtnComponent,
        DataTableComponent,
        ModalComponent,
        PaginationComponent,
        ContentBlockComponent,
        CheckboxComponent,
        ButtonCheckboxComponent,
        FormActionBarComponent,
        ConfirmComponent,
        DataTableFilterComponent,
        FilterPipe,
        DataTableCommonManagerComponent,
        ButtonBackComponent,
        PageHeadingComponent,
        InputItemComponent,
        ActionCellComponent,
        CurrencyCellComponent,
        PercentCellComponent,
        NumberCellComponent,
        DateCellComponent,
        BooleanCellComponent,
        InputItemErrorMessageComponent,
        StatusCellComponent,
        ConfirmCellComponent,
        RationaleModalComponent
    ],
    exports: [
        MatProgressSpinnerModule,
        TranslateModule,
        BtnComponent,
        DataTableComponent,
        ModalComponent,
        PaginationComponent,
        ContentBlockComponent,
        CheckboxComponent,
        ButtonCheckboxComponent,
        FormActionBarComponent,
        ConfirmComponent,
        DataTableFilterComponent,
        FilterPipe,
        DataTableCommonManagerComponent,
        ButtonBackComponent,
        PageHeadingComponent,
        FormsModule,
        ReactiveFormsModule,
        InputItemComponent,
        DynamicModule,
        InputItemErrorMessageComponent,
        RationaleModalComponent,
    ]
})
export class SharedModule {}
