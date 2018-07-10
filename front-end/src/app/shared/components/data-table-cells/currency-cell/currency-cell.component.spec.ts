import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyCellComponent } from './currency-cell.component';

describe('CurrencyCellComponent', () => {
  let component: CurrencyCellComponent;
  let fixture: ComponentFixture<CurrencyCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
