import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';

import { Ng2FlatpickrModule } from 'ng2-flatpickr';

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
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        Ng2FlatpickrModule,
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
    ],
    exports: [
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
        FormsModule
    ]
})
export class SharedModule {}
