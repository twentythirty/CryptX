import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { DashboardComponent } from './dashboard.component';
import { DashboardModule } from '../dashboard.module';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getAllInvestments: () => {
    return fakeAsyncResponse({
      success: true,
      investment_runs: [
        {
          id: 39,
          started_timestamp: 1535550316458,
          updated_timestamp: 1535605305957,
          completed_timestamp: null,
          strategy_type: "investment.strategy.101",
          is_simulated: "investment.is_simulated.yes",
          user_created: "Tautvydas Petkunas",
          user_created_id: 3,
          status: "investment.status.302",
          deposit_usd: "100000000"
        }
      ],
      footer: [],
      count: 1
    });
  },

  getAllInvestmentsHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DashboardModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InvestmentService, useValue: InvestmentServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load transfers on init', () => {
    InvestmentServiceStub.getAllInvestments().subscribe(res => {
      expect(component.investmentsDataSource.body).toEqual(res.investment_runs);
      expect(component.investmentsDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

});
