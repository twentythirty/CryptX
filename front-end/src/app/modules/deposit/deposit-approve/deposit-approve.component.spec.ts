import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules } from '../../../testing/utils';

import { DepositApproveComponent } from './deposit-approve.component';
import { DepositModule } from '../deposit.module';

describe('DepositApproveComponent', () => {
  let component: DepositApproveComponent;
  let fixture: ComponentFixture<DepositApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DepositModule,
        ...extraTestingModules
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
