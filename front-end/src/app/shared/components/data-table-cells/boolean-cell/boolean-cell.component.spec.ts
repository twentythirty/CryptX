import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanCellComponent } from './boolean-cell.component';

describe('BooleanCellComponent', () => {
  let component: BooleanCellComponent;
  let fixture: ComponentFixture<BooleanCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BooleanCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
