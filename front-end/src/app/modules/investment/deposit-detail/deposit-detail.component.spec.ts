import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { DepositDetailComponent } from './deposit-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getSingleRecipe: () => {
    return fakeAsyncResponse({
      success: true,
      recipe_run: {
        id: 60,
        investment_run_id: 33,
        created_timestamp: '2018-08-23T08:22:42.380Z',
        approval_status: 'recipes.status.43',
        approval_comment: 'Ok',
        approval_timestamp: '2018-08-23T08:23:12.535Z',
        user_created_id: 3,
        user_created: 'Test User',
        approval_user_id: 3,
        approval_user: 'Test User'
      }
    });
  },

  getAllRecipeDeposits: () => {
    return fakeAsyncResponse({
      success: true,
      recipe_deposits: [
        {
          id: 47,
          recipe_run_id: 60,
          investment_run_id: 33,
          quote_asset_id: 2,
          quote_asset: 'BTC',
          exchange_id: 1,
          exchange: 'Binance',
          account: '1GDff323q4RGghgLVTi9xeqSkyzRjRrK2',
          amount: '0.09471008',
          investment_percentage: '61.111111111111105',
          deposit_management_fee: '0',
          depositor_user: 'Test User',
          status: 'deposits.status.151'
        }
      ],
      footer: [],
      count: 1
    });
  },

  getAllDepositDetailsHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  }
};


describe('DepositDetailComponent', () => {
  let component: DepositDetailComponent;
  let fixture: ComponentFixture<DepositDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InvestmentService, useValue: InvestmentServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
