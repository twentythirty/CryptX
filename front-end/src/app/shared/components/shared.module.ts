import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BtnComponent } from './btn/btn.component'
import { DataTableComponent } from './data-table/data-table.component'
import { ModalComponent } from './modal/modal.component'
import { PaginationComponent } from './pagination/pagination.component';
import { ContentBlockComponent } from './content-block/content-block.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { ButtonCheckboxComponent } from './button-checkbox/button-checkbox.component';
import { FormActionBarComponent } from './form-action-bar/form-action-bar.component'

@NgModule({
    imports: [
        CommonModule
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
    ]
})
export class SharedModule {}
