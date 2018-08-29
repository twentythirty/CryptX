import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentCellComponent } from './percent-cell.component';

describe('PercentCellComponent', () => {
  let component: PercentCellComponent;
  let fixture: ComponentFixture<PercentCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
