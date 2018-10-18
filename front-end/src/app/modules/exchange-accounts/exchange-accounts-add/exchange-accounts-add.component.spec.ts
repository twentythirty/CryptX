import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeAccountsAddComponent } from './exchange-accounts-add.component';

describe('ExchangeAccountsAddComponent', () => {
  let component: ExchangeAccountsAddComponent;
  let fixture: ComponentFixture<ExchangeAccountsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeAccountsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeAccountsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
