import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { testingTranslateModule, extraTestingModules } from '../../../testing/utils';

import { DataTableComponent, TableDataColumn } from './data-table.component';
import { SharedModule } from '../../shared.module';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;

    component.dataSource = {
      header: [
        { column: 'test', nameKey: 'test' }
      ],
      body: null
    };
    component.columnsToShow = [
      new TableDataColumn({ column: 'test' })
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
