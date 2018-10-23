import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeCredentialsAddComponent } from './exchange-credentials-add.component';

describe('ExchangeCredentialsAddComponent', () => {
  let component: ExchangeCredentialsAddComponent;
  let fixture: ComponentFixture<ExchangeCredentialsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeCredentialsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeCredentialsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
