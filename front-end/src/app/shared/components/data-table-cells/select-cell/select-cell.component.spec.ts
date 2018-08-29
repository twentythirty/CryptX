import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCellComponent } from './select-cell.component';

describe('SelectCellComponent', () => {
  let component: SelectCellComponent;
  let fixture: ComponentFixture<SelectCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
