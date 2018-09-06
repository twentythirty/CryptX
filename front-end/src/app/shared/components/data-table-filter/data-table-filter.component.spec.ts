import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule, MatDatepickerModule, MatFormField } from '@angular/material';
import { testingTranslateModule } from '../../../testing/utils';

import { DataTableFilterComponent } from './data-table-filter.component';
import { FilterPipe } from '../../pipes/filter.pipe';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { BtnComponent } from '../btn/btn.component';

describe('DataTableFilterComponent', () => {
  let component: DataTableFilterComponent;
  let fixture: ComponentFixture<DataTableFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataTableFilterComponent,
        FilterPipe,
        CheckboxComponent,
        MatFormField,
        BtnComponent,
      ],
      imports: [
        FormsModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        testingTranslateModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
