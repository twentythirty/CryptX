import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberCellComponent } from './number-cell.component';

describe('NumberCellComponent', () => {
  let component: NumberCellComponent;
  let fixture: ComponentFixture<NumberCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
