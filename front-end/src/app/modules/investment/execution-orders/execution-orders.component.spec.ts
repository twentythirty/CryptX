import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { ExecutionOrdersComponent } from './execution-orders.component';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getAllExecOrders: () => {
    return fakeAsyncResponse({});
  },

  getAllExecutionOrdersHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  }
};


describe('ExecutionOrdersComponent', () => {
  let component: ExecutionOrdersComponent;
  let fixture: ComponentFixture<ExecutionOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InvestmentService, useValue: InvestmentServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
