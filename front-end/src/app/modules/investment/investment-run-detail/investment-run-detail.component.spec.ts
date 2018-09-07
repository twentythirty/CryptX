import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { InvestmentRunDetailComponent } from './investment-run-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getSingleInvestment: () => {
    return fakeAsyncResponse({
      success: true,
      investment_run: {
        id: 38,
        started_timestamp: 1535519199589,
        updated_timestamp: 1535631300582,
        completed_timestamp: 1535631300582,
        strategy_type: 'investment.strategy.102',
        is_simulated: 'investment.is_simulated.yes',
        user_created: 'Karolis Petreikis',
        user_created_id: 4,
        status: 'investment.status.308',
        deposit_usd: '5000'
      }
    });
  },

  getAllRecipes: () => {
    return fakeAsyncResponse({
      success: true,
      recipe_runs: [{
        id: 67,
        investment_run_id: 38,
        created_timestamp: 1535519204870,
        approval_status: 'recipes.status.43',
        approval_comment: 'test',
        approval_timestamp: 1535519220752,
        user_created_id: 4,
        user_created: 'Test User',
        approval_user_id: 4,
        approval_user: 'Test User'
      }],
      footer: [],
      count: 1
    });
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  },

  createRecipeRun: () => {
    return fakeAsyncResponse({});
  }
};


describe('InvestmentRunDetailComponent', () => {
  let component: InvestmentRunDetailComponent;
  let fixture: ComponentFixture<InvestmentRunDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        CurrencyPipe,
        { provide: InvestmentService, useValue: InvestmentServiceStub }
      ]
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
