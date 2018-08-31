import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InvestmentModule } from '../investment.module';
import { ExecutionOrderFillDetailComponent } from './execution-order-fill-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { ExecutionOrdersService } from '../../../services/execution-orders/execution-orders.service';


const InvestmentServiceStub = {
  getSingleExecutionOrder: () => {
    return fakeAsyncResponse({});
  },

  getAllExecOrdersFills: () => {
    return fakeAsyncResponse({});
  },

  getAllExecutionOrdersFillsHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  }
};

const ExecutionOrdersServiceStub = {
  changeExecutionOrderStatus: () => {
    return fakeAsyncResponse({});
  }
};


describe('ExecutionOrderFillDetailComponent', () => {
  let component: ExecutionOrderFillDetailComponent;
  let fixture: ComponentFixture<ExecutionOrderFillDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InvestmentService, useValue: InvestmentServiceStub },
        { provide: ExecutionOrdersService, useValue: ExecutionOrdersServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderFillDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
