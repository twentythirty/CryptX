import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InvestmentModule } from '../investment.module';
import { InvestmentRunDetailComponent } from './investment-run-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getSingleInvestment: () => {
    return fakeAsyncResponse({});
  },

  getAllRecipes: () => {
    return fakeAsyncResponse({});
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
