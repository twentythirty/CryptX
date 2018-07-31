import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentNewComponent } from './investment-new.component';

describe('InvestmentNewComponent', () => {
  let component: InvestmentNewComponent;
  let fixture: ComponentFixture<InvestmentNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
