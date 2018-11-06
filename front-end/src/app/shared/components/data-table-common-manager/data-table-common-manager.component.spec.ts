import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules } from '../../../testing/utils';

import { DataTableCommonManagerComponent } from './data-table-common-manager.component';

describe('DataTableCommonManagerComponent', () => {
  let component: DataTableCommonManagerComponent;
  let fixture: ComponentFixture<DataTableCommonManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataTableCommonManagerComponent ],
      imports: [
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableCommonManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
