import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InvestmentModule } from '../investment.module';
import { OrderDetailComponent } from './order-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getAllOrders: () => {
    return fakeAsyncResponse({});
  },

  getAllOrdersHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getSingleRecipe: () => {
    return fakeAsyncResponse({});
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  }
};


describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;

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
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
