import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentRunDetailComponent } from './investment-run-detail.component';

describe('InvestmentRunDetailComponent', () => {
  let component: InvestmentRunDetailComponent;
  let fixture: ComponentFixture<InvestmentRunDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentRunDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentRunDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
