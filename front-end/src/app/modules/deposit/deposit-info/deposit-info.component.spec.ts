import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositInfoComponent } from './deposit-info.component';

describe('DepositInfoComponent', () => {
  let component: DepositInfoComponent;
  let fixture: ComponentFixture<DepositInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
