import { NgModule, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DynamicModule } from 'ng-dynamic-component';

import { BtnComponent } from './components/btn/btn.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { ModalComponent } from './components/modal/modal.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ContentBlockComponent } from './components/content-block/content-block.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { ButtonCheckboxComponent } from './components/button-checkbox/button-checkbox.component';
import { FormActionBarComponent } from './components/form-action-bar/form-action-bar.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { DataTableFilterComponent } from './components/data-table-filter/data-table-filter.component';

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
import { MatProgressSpinnerModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule } from '@angular/material';
import { RationaleModalComponent } from './components/rationale-modal/rationale-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputCellComponent } from './components/data-table-cells/input-cell/input-cell.component';
import { SelectCellComponent } from './components/data-table-cells/select-cell/select-cell.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ButtonRadioComponent } from './components/button-radio/button-radio.component';
import { ActionLogComponent } from './components/action-log/action-log.component';
import { NguiAutoCompleteModule } from '@ngui/auto-complete/dist';
import { NgSelectModule } from '@ng-select/ng-select';
import { MarkAsTouchedDirective } from './directives/mark-as-touched.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        MatProgressSpinnerModule,
        TranslateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatInputModule,
        DynamicModule.withComponents([
          ActionCellComponent,
          CurrencyCellComponent,
          PercentCellComponent,
          NumberCellComponent,
          DateCellComponent,
          InputCellComponent,
          SelectCellComponent,
          BooleanCellComponent,
          StatusCellComponent,
          ConfirmCellComponent
        ]),
        NguiAutoCompleteModule,
        NgSelectModule,
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
        RationaleModalComponent,
        InputCellComponent,
        SelectCellComponent,
        TimelineComponent,
        ButtonRadioComponent,
        ActionLogComponent,
        MarkAsTouchedDirective,
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
        InputCellComponent,
        SelectCellComponent,
        TimelineComponent,
        ButtonRadioComponent,
        ActionLogComponent,
        MarkAsTouchedDirective,
        NgSelectModule,
    ]
})
export class SharedModule {}
