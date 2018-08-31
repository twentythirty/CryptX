import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { DepositModule } from '../deposit.module';
import { DepositInfoComponent } from './deposit-info.component';
import { DepositService, DepositResultData } from '../../../services/deposit/deposit.service';
import { InvestmentService } from '../../../services/investment/investment.service';


const DepositServiceStub = {
  getDeposit: () => {
    return fakeAsyncResponse<DepositResultData>({
      success: true,
      recipe_deposit: {
        id: 80,
        recipe_run_id: 67,
        investment_run_id: 38,
        quote_asset_id: 312,
        quote_asset: 'ETH',
        exchange_id: 7,
        exchange: 'Huobi',
        account: '0xbb21d3b9806b4b5d654e13cba283e1f37b35028b',
        amount: '10',
        investment_percentage: '11.111111111111110',
        deposit_management_fee: '1',
        depositor_user: 'Test User',
        status: 'deposits.status.151'
      },
      action_logs: [
        {
          id: 156871,
          timestamp: 1535519306322,
          level: 1,
          translationKey: 'logs.universal.modified_user',
          translationArgs: {
            user_name: 'Test User',
            column: 'Status',
            prev_value: '{deposits.status.150}',
            new_value: '{deposits.status.151}'
          }
        },
      ]
    });
  }
};

const InvestmentServiceStub = {
  getAllTimelineData: () => {
    return fakeAsyncResponse({
      investment_run: {
        id: 38,
        started_timestamp: 1535519199589,
        updated_timestamp: 1535631300582,
        completed_timestamp: '2018-08-30T12:15:00.582Z',
        strategy_type: 'investment.strategy.102',
        is_simulated: true,
        status: 'investment.status.308',
        deposit_usd: '5000',
        user_created_id: 4
      },
      recipe_run: {
        id: 67,
        created_timestamp: 1535519204870,
        approval_status: 'recipes.status.43',
        approval_timestamp: 1535519220752,
        approval_comment: 'test',
        investment_run_id: 38,
        user_created_id: 4,
        approval_user_id: 4
      },
      recipe_deposits: {
        count: 5,
        status: 'deposits.status.151'
      },
      recipe_orders: {
        count: 18,
        order_group_id: 35,
        status: 'order.status.53'
      },
      execution_orders: {
        count: 1756,
        status: 'execution_orders_timeline.status.63'
      }
    });
  }
};


describe('DepositInfoComponent', () => {
  let component: DepositInfoComponent;
  let fixture: ComponentFixture<DepositInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DepositModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: DepositService, useValue: DepositServiceStub },
        { provide: InvestmentService, useValue: InvestmentServiceStub },
      ]
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
