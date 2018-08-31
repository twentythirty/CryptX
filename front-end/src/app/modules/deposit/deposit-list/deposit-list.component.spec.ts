import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { DepositModule } from '../deposit.module';
import { DepositListComponent } from './deposit-list.component';
import { DepositService, DepositsAllResponse } from '../../../services/deposit/deposit.service';


const DepositServiceStub = {
  getAllDeposits: () => {
    return fakeAsyncResponse<DepositsAllResponse>({
      success: true,
      recipe_deposits: [
        {
          id: 80,
          recipe_run_id: 67,
          investment_run_id: 38,
          quote_asset_id: 312,
          quote_asset: "ETH",
          exchange_id: 7,
          exchange: "Huobi",
          account: "0xbb21d3b9806b4b5d654e13cba283e1f37b35028b",
          amount: "10",
          investment_percentage: "11.111111111111110",
          deposit_management_fee: "1",
          depositor_user: "Test User",
          status: "deposits.status.151"
        },
      ],
      footer: [],
      count: 1
    });
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('DepositListComponent', () => {
  let component: DepositListComponent;
  let fixture: ComponentFixture<DepositListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DepositModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: DepositService, useValue: DepositServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load deposits on init', () => {
    DepositServiceStub.getAllDeposits().subscribe(res => {
      expect(component.depositDataSource.body).toEqual(res.recipe_deposits);
      expect(component.depositDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

});
